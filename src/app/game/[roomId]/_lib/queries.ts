import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { MatchWithPlayers, MatchPlayer } from './types'

export async function getMatch(
    matchId: string
): Promise<MatchWithPlayers | null> {
    const supabase = await createSupabaseServerClient()

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
    const supabase = await createSupabaseServerClient()

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

export async function getPlayerByUserId(
    matchId: string,
    userId: string
): Promise<MatchPlayer | null> {
    const supabase = await createSupabaseServerClient()

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
