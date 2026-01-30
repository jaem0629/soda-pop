import { createSupabaseServerClient } from './supabase/server'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

/**
 * 서버에서 현재 인증된 사용자 가져오기
 */
export async function getServerUser(): Promise<User | null> {
    const serverSupabase = await createSupabaseServerClient()
    const {
        data: { user },
    } = await serverSupabase.auth.getUser()
    return user
}

/**
 * 현재 사용자의 ID 가져오기 (서버용)
 */
export async function getServerUserId(): Promise<string | null> {
    const user = await getServerUser()
    return user?.id ?? null
}

/**
 * 사용자 프로필 생성/업데이트 (upsert)
 * 닉네임이 변경되면 업데이트
 */
export async function upsertUserProfile(
    userId: string,
    username: string
): Promise<boolean> {
    const { error } = await supabase.from('users').upsert(
        {
            id: userId,
            username,
        },
        {
            onConflict: 'id',
        }
    )

    if (error) {
        console.error('사용자 프로필 upsert 실패:', error)
        return false
    }

    return true
}

/**
 * 매치에서 현재 사용자의 플레이어 정보 가져오기
 */
export async function getMyPlayerInMatch(
    matchId: string,
    userId: string
): Promise<{ id: string; player_order: number } | null> {
    const { data, error } = await supabase
        .from('match_players')
        .select('id, player_order')
        .eq('match_id', matchId)
        .eq('user_id', userId)
        .single()

    if (error || !data) {
        return null
    }

    return data
}
