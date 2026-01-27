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
    created_at: string
}

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

// 방 참가
export async function joinRoom(
    code: string,
    playerName: string
): Promise<{ room: Room; playerNumber: 1 | 2 } | null> {
    // 방 조회
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

    // 이미 게임 중이면 참가 불가
    if (roomData.status !== 'waiting') {
        console.error('이미 게임이 시작됨')
        return null
    }

    // player2로 참가
    if (roomData.player2_name) {
        console.error('방이 가득 참')
        return null
    }

    const { data: updatedRoom, error: updateError } = await supabase
        .from('rooms')
        .update({
            player2_name: playerName,
            status: 'playing',
        })
        .eq('id', roomData.id)
        .select()
        .single()

    if (updateError || !updatedRoom) {
        console.error('방 참가 실패:', updateError)
        return null
    }

    return { room: updatedRoom as Room, playerNumber: 2 }
}

// 방 정보 조회
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
