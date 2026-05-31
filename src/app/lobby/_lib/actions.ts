'use server'

import { getAuthUser } from '@/app/_lib/queries'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getActiveMatch } from './queries'

type GameMode = 'solo' | 'battle'
type EntryType = 'private' | 'public'
type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>
type JoinableMatch = {
  id: string
  entry_type: EntryType
  status: 'waiting' | 'matching' | 'playing' | 'finished' | 'abandoned'
  max_players: number
}
type JoinMatchResult = { success: boolean; matchId?: string; error?: string }

const MODE_MAX_PLAYERS: Record<GameMode, number> = {
  solo: 1,
  battle: 2,
}
const QUICK_BATTLE_LIMIT = 5

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const randomValues = crypto.getRandomValues(new Uint8Array(6))
  return Array.from(randomValues, (v) => chars[v % chars.length]).join('')
}

async function joinExistingMatch(
  supabase: SupabaseClient,
  params: {
    match: JoinableMatch
    userId: string
    playerName: string
    shouldRequirePublic?: boolean
  },
): Promise<JoinMatchResult> {
  if (params.shouldRequirePublic && params.match.entry_type !== 'public') {
    return { success: false, error: 'This match requires a code to join' }
  }

  if (
    params.match.status === 'finished' ||
    params.match.status === 'abandoned'
  ) {
    return { success: false, error: 'Game already ended' }
  }

  if (params.match.status === 'playing') {
    return { success: false, error: 'Game already in progress' }
  }

  const { data: existingPlayers, error: playersError } = await supabase
    .from('match_players')
    .select('user_id, player_order')
    .eq('match_id', params.match.id)
    .order('player_order', { ascending: true })

  if (playersError) {
    return { success: false, error: 'Error occurred' }
  }

  const players = existingPlayers ?? []

  const existingPlayer = players.find(
    (player) => player.user_id === params.userId,
  )
  if (existingPlayer) {
    return { success: true, matchId: params.match.id }
  }

  if (players.length >= params.match.max_players) {
    return { success: false, error: 'Match is full' }
  }

  const usedOrders = new Set(players.map((player) => player.player_order))
  const nextOrder = Array.from(
    { length: params.match.max_players },
    (_, index) => index + 1,
  ).find((order) => !usedOrders.has(order))

  if (!nextOrder) {
    return { success: false, error: 'Match is full' }
  }

  const { error: insertError } = await supabase.from('match_players').insert({
    match_id: params.match.id,
    user_id: params.userId,
    player_name: params.playerName,
    player_order: nextOrder,
    is_host: false,
  })

  if (insertError) {
    if (insertError.code === '23505') {
      return { success: false, error: 'Match is full' }
    }

    console.error('Player addition failed:', insertError)
    return { success: false, error: 'Failed to join match' }
  }

  return { success: true, matchId: params.match.id }
}

export async function createMatch(
  playerName: string,
  mode: GameMode = 'battle',
  entryType: EntryType = 'private',
): Promise<JoinMatchResult> {
  const user = await getAuthUser()

  if (!user) {
    return { success: false, error: 'Authentication required' }
  }

  const activeMatch = await getActiveMatch(user.id)
  if (activeMatch) {
    return { success: false, error: 'Already in a game' }
  }

  const supabase = await createSupabaseServerClient()

  const isSolo = mode === 'solo'
  const isPrivateBattle = mode === 'battle' && entryType === 'private'
  const code = isPrivateBattle ? generateCode() : null

  const { data: match, error: matchError } = await supabase
    .from('matches')
    .insert({
      mode,
      entry_type: isSolo ? 'private' : entryType,
      code,
      max_players: MODE_MAX_PLAYERS[mode],
      status: isSolo ? 'playing' : 'waiting',
      started_at: isSolo ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (matchError || !match) {
    console.error('Match creation failed:', matchError)
    return { success: false, error: 'Failed to create match' }
  }

  const { error: playerError } = await supabase.from('match_players').insert({
    match_id: match.id,
    user_id: user.id,
    player_name: playerName,
    player_order: 1,
    is_host: true,
  })

  if (playerError) {
    console.error('Player addition failed:', playerError)
    await supabase
      .from('matches')
      .update({ status: 'abandoned' })
      .eq('id', match.id)
    return { success: false, error: 'Failed to create match' }
  }

  return { success: true, matchId: match.id }
}

export async function joinQuickBattle(
  playerName: string,
): Promise<JoinMatchResult> {
  const user = await getAuthUser()

  if (!user) {
    return { success: false, error: 'Authentication required' }
  }

  const activeMatch = await getActiveMatch(user.id)
  if (activeMatch) {
    return { success: false, error: 'Already in a game' }
  }

  const supabase = await createSupabaseServerClient()
  const { data: matches, error } = await supabase
    .from('matches')
    .select('id, max_players, match_players(user_id)')
    .eq('mode', 'battle')
    .eq('entry_type', 'public')
    .eq('status', 'waiting')
    .order('created_at', { ascending: true })
    .limit(QUICK_BATTLE_LIMIT)

  if (error) {
    console.error('Quick battle lookup failed:', error)
    return { success: false, error: 'Failed to find battle' }
  }

  const match = matches?.find(
    (candidate) =>
      (candidate.match_players?.length ?? 0) < candidate.max_players,
  )

  if (match) {
    return await joinMatchById(match.id, playerName)
  }

  return await createMatch(playerName, 'battle', 'public')
}

export async function joinMatch(
  code: string,
  playerName: string,
): Promise<JoinMatchResult> {
  const user = await getAuthUser()

  if (!user) {
    return { success: false, error: 'Authentication required' }
  }

  const activeMatch = await getActiveMatch(user.id, code.toUpperCase())
  if (activeMatch) {
    return { success: false, error: 'Already in a game' }
  }

  const supabase = await createSupabaseServerClient()

  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('id, entry_type, status, max_players')
    .eq('code', code.toUpperCase())
    .single()

  if (matchError || !match) {
    return { success: false, error: 'Match not found' }
  }

  return await joinExistingMatch(supabase, {
    match,
    userId: user.id,
    playerName,
  })
}

export async function joinMatchById(
  matchId: string,
  playerName: string,
): Promise<JoinMatchResult> {
  const user = await getAuthUser()

  if (!user) {
    return { success: false, error: 'Authentication required' }
  }

  const activeMatch = await getActiveMatch(user.id)
  if (activeMatch) {
    return { success: false, error: 'Already in a game' }
  }

  const supabase = await createSupabaseServerClient()

  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('id, entry_type, status, max_players')
    .eq('id', matchId)
    .single()

  if (matchError || !match) {
    return { success: false, error: 'Match not found' }
  }

  return await joinExistingMatch(supabase, {
    match,
    userId: user.id,
    playerName,
    shouldRequirePublic: true,
  })
}

export async function getAuthUserId(): Promise<string | null> {
  const user = await getAuthUser()
  return user?.id ?? null
}
