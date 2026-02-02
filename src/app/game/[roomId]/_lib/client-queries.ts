'use client'

/**
 * Query functions for client components
 * (Used to fetch data on realtime updates)
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
        console.error('Failed to fetch match:', matchError)
        return null
    }

    const { data: players, error: playersError } = await supabase
        .from('match_players')
        .select()
        .eq('match_id', matchId)
        .order('player_order', { ascending: true })

    if (playersError) {
        console.error('Failed to fetch players:', playersError)
        return null
    }

    return {
        ...match,
        players: players ?? [],
    }
}
