'use server'

import { upsertUserProfile } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * 익명 로그인 및 사용자 프로필 생성 후 게임 방으로 리다이렉트
 */
export async function signInAndRedirect(
    nickname: string,
    roomId: string
): Promise<void> {
    const supabase = await createSupabaseServerClient()

    // 현재 세션 확인
    let {
        data: { user },
    } = await supabase.auth.getUser()

    // 로그인되지 않은 경우 익명 로그인
    if (!user) {
        const { data, error } = await supabase.auth.signInAnonymously()
        if (error || !data.user) {
            console.error('익명 로그인 실패:', error)
            throw new Error('로그인에 실패했습니다')
        }
        user = data.user
    }

    // 사용자 프로필 upsert (닉네임 저장/업데이트)
    await upsertUserProfile(user.id, nickname)

    redirect(`/game/${roomId}`)
}

/**
 * 현재 인증된 사용자 ID 가져오기
 */
export async function getAuthUserId(): Promise<string | null> {
    const supabase = await createSupabaseServerClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    return user?.id ?? null
}

/**
 * 익명 로그인 (필요시)
 */
export async function ensureSignedIn(
    nickname: string
): Promise<{ userId: string }> {
    const supabase = await createSupabaseServerClient()

    let {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        const { data, error } = await supabase.auth.signInAnonymously()
        if (error || !data.user) {
            throw new Error('로그인에 실패했습니다')
        }
        user = data.user
    }

    await upsertUserProfile(user.id, nickname)

    return { userId: user.id }
}
