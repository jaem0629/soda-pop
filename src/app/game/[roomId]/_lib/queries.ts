import { cache } from 'react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { MatchWithPlayers, MatchPlayer } from './types'

export const getMatch = cache(
  async (matchId: string): Promise<MatchWithPlayers | null> => {
    console.log('🔍 [cache] getMatch 실행:', matchId, new Date().toISOString())
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
  },
)

export const getPlayerById = cache(
  async (playerId: string): Promise<MatchPlayer | null> => {
    console.log('🔍 [cache] getPlayerById 실행:', playerId)
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
  },
)

export const getPlayerByUserId = cache(
  async (matchId: string, userId: string): Promise<MatchPlayer | null> => {
    console.log(
      '🔍 [cache] getPlayerByUserId 실행:',
      matchId,
      userId,
      new Date().toISOString(),
    )
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
  },
)
