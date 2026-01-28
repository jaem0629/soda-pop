import { supabase } from './supabase'
import { generateRoomCode } from './utils'

// ================================================
// 타입 정의
// ================================================

export type GameMode = 'solo' | 'battle' | 'coop' | 'custom'
export type EntryType = 'private' | 'matchmaking'
export type MatchStatus = 'waiting' | 'matching' | 'playing' | 'finished' | 'abandoned'

export type Match = {
    id: string
    mode: GameMode
    entry_type: EntryType
    code: string | null
    max_players: number
    team_size: number | null
    status: MatchStatus
    settings: {
        time_limit: number
        board_size: number
    }
    created_at: string
    started_at: string | null
    finished_at: string | null
    expired_at: string | null
}

export type MatchPlayer = {
    id: string
    match_id: string
    user_id: string | null
    player_name: string
    player_order: number
    team_number: number | null
    score: number
    is_host: boolean
    joined_at: string
}

// 매치 + 플레이어 정보 통합 타입
export type MatchWithPlayers = Match & {
    players: MatchPlayer[]
}

// 게임 시간 (초) - 기본값
export const GAME_DURATION = 60

// ================================================
// 매치 생성 (Battle - Private)
// ================================================

export async function createMatch(
    playerName: string,
    mode: GameMode = 'battle',
    entryType: EntryType = 'private'
): Promise<{ match: Match; player: MatchPlayer } | null> {
    const code = entryType === 'private' ? generateRoomCode() : null

    // 1. 매치 생성
    const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
            mode,
            entry_type: entryType,
            code,
            max_players: mode === 'battle' ? 2 : mode === 'coop' ? 4 : 2,
            team_size: mode === 'coop' ? 2 : null,
            status: 'waiting',
        })
        .select()
        .single()

    if (matchError || !match) {
        console.error('매치 생성 실패:', matchError)
        return null
    }

    // 2. 플레이어 추가 (호스트)
    const { data: player, error: playerError } = await supabase
        .from('match_players')
        .insert({
            match_id: match.id,
            player_name: playerName,
            player_order: 1,
            is_host: true,
        })
        .select()
        .single()

    if (playerError || !player) {
        console.error('플레이어 추가 실패:', playerError)
        // 매치 롤백 (만료 처리)
        await supabase.from('matches').update({ expired_at: new Date().toISOString() }).eq('id', match.id)
        return null
    }

    return { match: match as Match, player: player as MatchPlayer }
}

// ================================================
// 매치 참가 (코드로 참가)
// ================================================

export async function joinMatch(
    code: string,
    playerName: string
): Promise<{ match: Match; player: MatchPlayer; playerOrder: number } | null> {
    // 1. 매치 조회
    const { data: match, error: matchError } = await supabase
        .from('matches')
        .select()
        .eq('code', code.toUpperCase())
        .single()

    if (matchError || !match) {
        console.error('매치를 찾을 수 없음:', matchError)
        return null
    }

    const matchData = match as Match

    // 이미 종료된 게임
    if (matchData.status === 'finished' || matchData.status === 'abandoned') {
        console.error('이미 종료된 게임')
        return null
    }

    // 2. 기존 플레이어 조회
    const { data: existingPlayers, error: playersError } = await supabase
        .from('match_players')
        .select()
        .eq('match_id', matchData.id)
        .order('player_order', { ascending: true })

    if (playersError) {
        console.error('플레이어 조회 실패:', playersError)
        return null
    }

    const players = existingPlayers as MatchPlayer[]

    // 3. 이미 참가 중인지 확인 (재참가)
    const existingPlayer = players.find(p => p.player_name === playerName)
    if (existingPlayer) {
        return { match: matchData, player: existingPlayer, playerOrder: existingPlayer.player_order }
    }

    // 게임 진행 중이면 새 참가 불가
    if (matchData.status === 'playing') {
        console.error('이미 게임이 진행 중')
        return null
    }

    // 4. 자리가 있는지 확인
    if (players.length >= matchData.max_players) {
        console.error('방이 가득 참')
        return null
    }

    // 5. 새 플레이어 추가
    const nextOrder = players.length + 1
    const { data: newPlayer, error: insertError } = await supabase
        .from('match_players')
        .insert({
            match_id: matchData.id,
            player_name: playerName,
            player_order: nextOrder,
            is_host: false,
        })
        .select()
        .single()

    if (insertError || !newPlayer) {
        console.error('플레이어 추가 실패:', insertError)
        return null
    }

    return { match: matchData, player: newPlayer as MatchPlayer, playerOrder: nextOrder }
}

// ================================================
// 매치 조회 (플레이어 포함)
// ================================================

export async function getMatch(matchId: string): Promise<MatchWithPlayers | null> {
    // 1. 매치 조회
    const { data: match, error: matchError } = await supabase
        .from('matches')
        .select()
        .eq('id', matchId)
        .single()

    if (matchError || !match) {
        console.error('매치 조회 실패:', matchError)
        return null
    }

    // 2. 플레이어 조회
    const { data: players, error: playersError } = await supabase
        .from('match_players')
        .select()
        .eq('match_id', matchId)
        .order('player_order', { ascending: true })

    if (playersError) {
        console.error('플레이어 조회 실패:', playersError)
        return null
    }

    return {
        ...(match as Match),
        players: (players ?? []) as MatchPlayer[],
    }
}

// ================================================
// 게임 시작
// ================================================

export async function startMatch(matchId: string): Promise<Match | null> {
    const { data, error } = await supabase
        .from('matches')
        .update({
            status: 'playing',
            started_at: new Date().toISOString(),
        })
        .eq('id', matchId)
        .select()
        .single()

    if (error) {
        console.error('게임 시작 실패:', error)
        return null
    }

    return data as Match
}

// ================================================
// 남은 시간 계산
// ================================================

export function calculateTimeLeft(startedAt: string | null, duration: number = GAME_DURATION): number {
    if (!startedAt) return duration

    // DB 타임스탬프 파싱 (다양한 형식 지원)
    // - "2026-01-28T14:17:48.878+00:00" (ISO with offset)
    // - "2026-01-28T14:17:48.878Z" (ISO with Z)
    // - "2026-01-28 14:17:48.878" (space separator)
    const startTime = new Date(startedAt).getTime()

    if (isNaN(startTime)) {
        console.error('Invalid startedAt timestamp:', startedAt)
        return duration
    }

    const now = Date.now()
    const elapsed = Math.floor((now - startTime) / 1000)
    const remaining = duration - elapsed

    return Math.max(0, remaining)
}

// ================================================
// 점수 업데이트
// ================================================

export async function updatePlayerScore(
    matchId: string,
    playerOrder: number,
    score: number
): Promise<boolean> {
    const { error } = await supabase
        .from('match_players')
        .update({ score })
        .eq('match_id', matchId)
        .eq('player_order', playerOrder)

    if (error) {
        console.error('점수 업데이트 실패:', error)
        return false
    }

    return true
}

// ================================================
// 게임 종료
// ================================================

export async function finishMatch(matchId: string): Promise<boolean> {
    const { error } = await supabase
        .from('matches')
        .update({ 
            status: 'finished',
            finished_at: new Date().toISOString(),
        })
        .eq('id', matchId)

    if (error) {
        console.error('게임 종료 실패:', error)
        return false
    }

    return true
}

// ================================================
// 매치 만료 (나가기)
// ================================================

export async function leaveMatch(matchId: string): Promise<boolean> {
    const { error } = await supabase
        .from('matches')
        .update({ expired_at: new Date().toISOString() })
        .eq('id', matchId)

    if (error) {
        console.error('매치 만료 실패:', error)
        return false
    }

    return true
}

// ================================================
// 플레이어 정보 조회 (by player_order)
// ================================================

export function getPlayerByOrder(players: MatchPlayer[], order: number): MatchPlayer | undefined {
    return players.find(p => p.player_order === order)
}

// ================================================
// 상대방 정보 조회
// ================================================

export function getOpponent(players: MatchPlayer[], myOrder: number): MatchPlayer | undefined {
    return players.find(p => p.player_order !== myOrder)
}
