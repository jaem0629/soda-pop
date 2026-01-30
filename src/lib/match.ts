import { supabase } from './supabase'
import type { Database } from '@/../supabase/database'

type Tables = Database['public']['Tables']
type Enums = Database['public']['Enums']

export type GameMode = Enums['game_mode']
export type EntryType = Enums['entry_type']
export type MatchStatus = Enums['match_status']

export type Match = Tables['matches']['Row']
export type MatchInsert = Tables['matches']['Insert']
export type MatchPlayer = Tables['match_players']['Row']
export type MatchPlayerInsert = Tables['match_players']['Insert']

export type MatchWithPlayers = Match & {
    players: MatchPlayer[]
}

export const GAME_DURATION = 60

function generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const randomValues = crypto.getRandomValues(new Uint8Array(6))
    return Array.from(randomValues, (v) => chars[v % chars.length]).join('')
}

export async function createMatch(
    playerName: string,
    userId: string,
    mode: GameMode = 'battle',
    entryType: EntryType = 'private'
): Promise<{ match: Match; player: MatchPlayer } | null> {
    const code = entryType === 'private' ? generateRoomCode() : null

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

    const { data: player, error: playerError } = await supabase
        .from('match_players')
        .insert({
            match_id: match.id,
            user_id: userId,
            player_name: playerName,
            player_order: 1,
            is_host: true,
        })
        .select()
        .single()

    if (playerError || !player) {
        console.error('플레이어 추가 실패:', playerError)
        await supabase
            .from('matches')
            .update({ expired_at: new Date().toISOString() })
            .eq('id', match.id)
        return null
    }

    return { match, player }
}

export async function joinMatch(
    code: string,
    playerName: string,
    userId: string
): Promise<{ match: Match; player: MatchPlayer; playerOrder: number } | null> {
    const { data: match, error: matchError } = await supabase
        .from('matches')
        .select()
        .eq('code', code.toUpperCase())
        .single()

    if (matchError || !match) {
        console.error('매치를 찾을 수 없음:', matchError)
        return null
    }

    if (match.status === 'finished' || match.status === 'abandoned') {
        console.error('이미 종료된 게임')
        return null
    }

    const { data: existingPlayers, error: playersError } = await supabase
        .from('match_players')
        .select()
        .eq('match_id', match.id)
        .order('player_order', { ascending: true })

    if (playersError) {
        console.error('플레이어 조회 실패:', playersError)
        return null
    }

    const players = existingPlayers ?? []

    // 같은 userId로 이미 참가한 경우 재연결
    const existingPlayer = players.find((p) => p.user_id === userId)
    if (existingPlayer) {
        return {
            match,
            player: existingPlayer,
            playerOrder: existingPlayer.player_order,
        }
    }

    if (match.status === 'playing') {
        console.error('이미 게임이 진행 중')
        return null
    }

    if (players.length >= match.max_players) {
        console.error('방이 가득 참')
        return null
    }

    const nextOrder = players.length + 1
    const { data: newPlayer, error: insertError } = await supabase
        .from('match_players')
        .insert({
            match_id: match.id,
            user_id: userId,
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

    return {
        match,
        player: newPlayer,
        playerOrder: nextOrder,
    }
}

export async function getMatch(
    matchId: string
): Promise<MatchWithPlayers | null> {
    const { data: match, error: matchError } = await supabase
        .from('matches')
        .select()
        .eq('id', matchId)
        .single()

    if (matchError || !match) {
        console.error('매치 조회 실패:', matchError)
        return null
    }

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
        ...match,
        players: players ?? [],
    }
}

export async function getPlayerById(
    playerId: string
): Promise<MatchPlayer | null> {
    const { data: player, error } = await supabase
        .from('match_players')
        .select()
        .eq('id', playerId)
        .single()

    if (error || !player) {
        console.error('플레이어 조회 실패:', error)
        return null
    }

    return player
}

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

    return data
}

export function calculateTimeLeft(
    startedAt: string | null,
    duration: number = GAME_DURATION
): number {
    if (!startedAt) return duration

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

export function getPlayerByOrder(
    players: MatchPlayer[],
    order: number
): MatchPlayer | undefined {
    return players.find((p) => p.player_order === order)
}

export function getOpponent(
    players: MatchPlayer[],
    myOrder: number
): MatchPlayer | undefined {
    return players.find((p) => p.player_order !== myOrder)
}

/**
 * 매치에서 특정 userId의 플레이어 찾기
 */
export async function getPlayerByUserId(
    matchId: string,
    userId: string
): Promise<MatchPlayer | null> {
    const { data, error } = await supabase
        .from('match_players')
        .select()
        .eq('match_id', matchId)
        .eq('user_id', userId)
        .single()

    if (error || !data) {
        return null
    }

    return data
}

/**
 * 플레이어 목록에서 userId로 플레이어 찾기 (로컬 검색)
 */
export function findPlayerByUserId(
    players: MatchPlayer[],
    userId: string
): MatchPlayer | undefined {
    return players.find((p) => p.user_id === userId)
}
