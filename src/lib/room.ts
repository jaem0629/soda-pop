import { supabase } from './supabase'
import { generateRoomCode } from './utils'

// 방 타입
export type Room = {
    id: string
    code: string
    player1_name: string | null
    player2_name: string | null
    player1_score: number
    player2_score: number
    status: 'waiting' | 'playing' | 'finished'
    started_at: string | null
    created_at: string
}

// 게임 시간 (초)
export const GAME_DURATION = 60

// 방 생성
export async function createRoom(playerName: string): Promise<Room | null> {
    const code = generateRoomCode()

    const { data, error } = await supabase
        .from('rooms')
        .insert({
            code,
            player1_name: playerName,
            status: 'waiting',
        })
        .select()
        .single()

    if (error) {
        console.error('방 생성 실패:', error)
        return null
    }

    return data as Room
}

// 방 참가 또는 재참가
export async function joinRoom(
    code: string,
    playerName: string
): Promise<{ room: Room; playerNumber: 1 | 2 } | null> {
    const { data: room, error: fetchError } = await supabase
        .from('rooms')
        .select()
        .eq('code', code.toUpperCase())
        .single()

    if (fetchError || !room) {
        console.error('방을 찾을 수 없음:', fetchError)
        return null
    }

    const roomData = room as Room

    // 이미 해당 닉네임으로 참가 중인지 확인 (재참가)
    if (roomData.player1_name === playerName) {
        return { room: roomData, playerNumber: 1 }
    }
    if (roomData.player2_name === playerName) {
        return { room: roomData, playerNumber: 2 }
    }

    // 게임이 이미 끝났으면 참가 불가
    if (roomData.status === 'finished') {
        console.error('이미 종료된 게임')
        return null
    }

    // 게임 진행 중이면 새 참가 불가
    if (roomData.status === 'playing') {
        console.error('이미 게임이 진행 중')
        return null
    }

    // player2 자리가 비어있으면 참가
    if (!roomData.player2_name) {
        const { data: updatedRoom, error: updateError } = await supabase
            .from('rooms')
            .update({ player2_name: playerName })
            .eq('id', roomData.id)
            .select()
            .single()

        if (updateError || !updatedRoom) {
            console.error('방 참가 실패:', updateError)
            return null
        }

        return { room: updatedRoom as Room, playerNumber: 2 }
    }

    // 방이 가득 참
    console.error('방이 가득 참')
    return null
}

// ID로 방 정보 조회
export async function getRoom(roomId: string): Promise<Room | null> {
    const { data, error } = await supabase
        .from('rooms')
        .select()
        .eq('id', roomId)
        .single()

    if (error) {
        console.error('방 조회 실패:', error)
        return null
    }

    return data as Room
}

// 게임 시작 (started_at 설정)
export async function startGame(roomId: string): Promise<Room | null> {
    const { data, error } = await supabase
        .from('rooms')
        .update({
            status: 'playing',
            started_at: new Date().toISOString(),
        })
        .eq('id', roomId)
        .select()
        .single()

    if (error) {
        console.error('게임 시작 실패:', error)
        return null
    }

    return data as Room
}

// 남은 시간 계산 (새로고침 시 복원용)
export function calculateTimeLeft(startedAt: string | null): number {
    if (!startedAt) return GAME_DURATION

    // DB 타임스탬프를 UTC로 파싱 (Supabase는 UTC로 저장)
    // "2026-01-27 13:03:07.804" → "2026-01-27T13:03:07.804Z"
    const utcString =
        startedAt.replace(' ', 'T') + (startedAt.includes('Z') ? '' : 'Z')
    const startTime = new Date(utcString).getTime()

    if (isNaN(startTime)) {
        console.error('Invalid startedAt timestamp:', startedAt)
        return GAME_DURATION
    }

    const now = Date.now()
    const elapsed = Math.floor((now - startTime) / 1000)
    const remaining = GAME_DURATION - elapsed

    return Math.max(0, remaining)
}

// 점수 업데이트
export async function updateScore(
    roomId: string,
    playerNumber: 1 | 2,
    score: number
): Promise<boolean> {
    const field = playerNumber === 1 ? 'player1_score' : 'player2_score'

    const { error } = await supabase
        .from('rooms')
        .update({ [field]: score })
        .eq('id', roomId)

    if (error) {
        console.error('점수 업데이트 실패:', error)
        return false
    }

    return true
}

// 게임 종료
export async function finishGame(roomId: string): Promise<boolean> {
    const { error } = await supabase
        .from('rooms')
        .update({ status: 'finished' })
        .eq('id', roomId)

    if (error) {
        console.error('게임 종료 실패:', error)
        return false
    }

    return true
}

// 방 삭제 (나가기)
export async function leaveRoom(roomId: string): Promise<boolean> {
    const { error } = await supabase.from('rooms').delete().eq('id', roomId)

    if (error) {
        console.error('방 삭제 실패:', error)
        return false
    }

    return true
}
