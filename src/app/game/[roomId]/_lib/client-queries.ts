'use client'

/**
 * 클라이언트 컴포넌트에서 사용하는 쿼리 함수들
 * (Realtime 업데이트 시 데이터 fetch)
 */
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { MatchWithPlayers } from './types'

export async function getMatchClient(
    matchId: string
): Promise<MatchWithPlayers | null> {
    const supabase = getSupabaseBrowserClient()
    
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
