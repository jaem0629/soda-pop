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
    .eq('status', 'waiting')
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
    .eq('status', 'playing')

  if (error) {
    console.error('Failed to finish game:', error)
    return false
  }

  await saveRankings(matchId)

  return true
}

async function upsertRanking(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  params: {
    mode: 'solo' | 'battle'
    matchId: string
    userId: string
    playerName: string
    score: number
    isWinner?: boolean
  },
): Promise<void> {
  const { data: existing } = await supabase
    .from('rankings')
    .select('id, score')
    .eq('mode', params.mode)
    .contains('user_ids', [params.userId])
    .order('score', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing && existing.score >= params.score) return

  if (existing) {
    await supabase
      .from('rankings')
      .update({
        match_id: params.matchId,
        player_names: [params.playerName],
        score: params.score,
        is_winner: params.isWinner ?? false,
        created_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
  } else {
    await supabase.from('rankings').insert({
      mode: params.mode,
      match_id: params.matchId,
      user_ids: [params.userId],
      player_names: [params.playerName],
      score: params.score,
      is_winner: params.isWinner ?? false,
    })
  }
}

async function saveRankings(matchId: string): Promise<void> {
  const supabase = await createSupabaseServerClient()

  const { data: match } = await supabase
    .from('matches')
    .select('mode')
    .eq('id', matchId)
    .single()

  if (!match) return

  const { data: players } = await supabase
    .from('match_players')
    .select('user_id, player_name, score')
    .eq('match_id', matchId)
    .order('score', { ascending: false })

  if (!players || players.length === 0) return

  if (match.mode === 'solo') {
    const player = players[0]
    if (!player.user_id) return

    await upsertRanking(supabase, {
      mode: 'solo',
      matchId,
      userId: player.user_id,
      playerName: player.player_name,
      score: player.score,
    })
  } else if (match.mode === 'battle') {
    const topScore = players[0]?.score ?? 0
    const isTie = players.length === 2 && players[0].score === players[1].score

    for (const player of players) {
      if (!player.user_id) continue

      await upsertRanking(supabase, {
        mode: 'battle',
        matchId,
        userId: player.user_id,
        playerName: player.player_name,
        score: player.score,
        isWinner: !isTie && player.score === topScore,
      })
    }
  }
}

/** Host leaves - abandons the entire match */
export async function leaveMatch(matchId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('matches')
    .update({ status: 'abandoned' })
    .eq('id', matchId)
    .in('status', ['waiting', 'matching'])

  if (error) {
    console.error('Failed to leave match:', error)
    return false
  }

  return true
}

/** Non-host player leaves - only removes themselves from the match */
export async function leaveMatchAsPlayer(matchId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { error } = await supabase
    .from('match_players')
    .delete()
    .eq('match_id', matchId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to leave match as player:', error)
    return false
  }

  return true
}
