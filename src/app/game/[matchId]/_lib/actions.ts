'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Match } from './types'

export async function startMatch(matchId: string): Promise<Match | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('matches')
    .update({
      status: 'playing',
      started_at: new Date().toISOString(),
    })
    .eq('id', matchId)
    .select()
    .single()

  if (error) {
    console.error('Failed to start game:', error)
    return null
  }

  return data
}

export async function updatePlayerScore(
  matchId: string,
  playerOrder: number,
  score: number,
): Promise<boolean> {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('match_players')
    .update({ score })
    .eq('match_id', matchId)
    .eq('player_order', playerOrder)

  if (error) {
    console.error('Failed to update score:', error)
    return false
  }

  return true
}

export async function finishMatch(matchId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('matches')
    .update({
      status: 'finished',
      finished_at: new Date().toISOString(),
    })
    .eq('id', matchId)

  if (error) {
    console.error('Failed to finish game:', error)
    return false
  }

  return true
}

/** Host leaves - abandons the entire match */
export async function leaveMatch(matchId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('matches')
    .update({ status: 'abandoned' })
    .eq('id', matchId)

  if (error) {
    console.error('Failed to leave match:', error)
    return false
  }

  return true
}

/** Non-host player leaves - only removes themselves from the match */
export async function leaveMatchAsPlayer(
  matchId: string,
  playerId: string,
): Promise<boolean> {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('match_players')
    .delete()
    .eq('match_id', matchId)
    .eq('id', playerId)

  if (error) {
    console.error('Failed to leave match as player:', error)
    return false
  }

  return true
}
