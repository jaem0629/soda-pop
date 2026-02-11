'use client'

/**
 * Query functions for client components
 * (Used to fetch data on realtime updates)
 */
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { MatchWithPlayers } from './types'

export async function getMatchClient(
  matchId: string,
): Promise<MatchWithPlayers | null> {
  const supabase = getSupabaseBrowserClient()

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
