import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { MatchWithPlayers, MatchPlayer } from './types'

export async function getMatch(
    matchId: string
): Promise<MatchWithPlayers | null> {
    const supabase = await createSupabaseServerClient()

    // Run queries in parallel
    const [matchResult, playersResult] = await Promise.all([
        supabase.from('matches').select().eq('id', matchId).single(),
        supabase
            .from('match_players')
            .select()
            .eq('match_id', matchId)
            .order('player_order', { ascending: true }),
    ])

    if (matchResult.error || !matchResult.data) {
        console.error('Failed to fetch match:', matchResult.error)
        return null
    }

    if (playersResult.error) {
        console.error('Failed to fetch players:', playersResult.error)
        return null
    }

    return {
        ...matchResult.data,
        players: playersResult.data ?? [],
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
        console.error('Failed to fetch player:', error)
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
