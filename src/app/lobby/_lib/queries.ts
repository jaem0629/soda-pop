import { createSupabaseServerClient } from '@/lib/supabase/server'

/** Get user's active match (waiting or playing) */
export async function getActiveMatch(userId: string, excludeCode?: string) {
  const supabase = await createSupabaseServerClient()

  const { data } = await supabase
    .from('matches')
    .select('id, code, status, match_players!inner(user_id)')
    .eq('match_players.user_id', userId)
    .in('status', ['waiting', 'matching', 'playing'])
    .maybeSingle()

  if (!data) return null
  if (excludeCode && data.code === excludeCode) return null
  return data
}

/** Get user profile */
export async function getUserProfile(userId: string) {
  const supabase = await createSupabaseServerClient()

  const { data } = await supabase
    .from('users')
    .select('username')
    .eq('id', userId)
    .single()
  return data
}

export type PlayerStats = {
  totalMatches: number
  wins: number
  losses: number
  bestScore: number
  winRate: number
}

/** Get player battle stats from rankings */
export async function getPlayerStats(userId: string): Promise<PlayerStats> {
  const supabase = await createSupabaseServerClient()

  const { data } = await supabase
    .from('rankings')
    .select('score, is_winner')
    .contains('user_ids', [userId])
    .eq('mode', 'battle')

  if (!data || data.length === 0) {
    return { totalMatches: 0, wins: 0, losses: 0, bestScore: 0, winRate: 0 }
  }

  const totalMatches = data.length
  const wins = data.filter((r) => r.is_winner).length
  const losses = totalMatches - wins
  const bestScore = Math.max(...data.map((r) => r.score))
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0

  return { totalMatches, wins, losses, bestScore, winRate }
}

export type LeaderboardEntry = {
  player_names: string[]
  score: number
  user_ids: string[]
  created_at: string | null
}

/** Get top 10 scores for a given mode */
export async function getLeaderboard(
  mode: 'solo' | 'battle',
): Promise<LeaderboardEntry[]> {
  const supabase = await createSupabaseServerClient()

  const { data } = await supabase
    .from('rankings')
    .select('player_names, score, user_ids, created_at')
    .eq('mode', mode)
    .order('score', { ascending: false })
    .limit(10)

  return data ?? []
}

export type WaitingMatch = {
  id: string
  entry_type: string
  max_players: number
  created_at: string | null
  host_name: string
  player_count: number
}

/** Get battle matches currently waiting for players */
export async function getWaitingMatches(): Promise<WaitingMatch[]> {
  const supabase = await createSupabaseServerClient()

  const { data } = await supabase
    .from('matches')
    .select(
      'id, entry_type, max_players, created_at, match_players(player_name, is_host)',
    )
    .eq('status', 'waiting')
    .eq('mode', 'battle')
    .order('created_at', { ascending: false })
    .limit(10)

  if (!data) return []

  return data.map((match) => {
    const players = match.match_players ?? []
    const host = players.find((p) => p.is_host)
    return {
      id: match.id,
      entry_type: match.entry_type,
      max_players: match.max_players,
      created_at: match.created_at,
      host_name: host?.player_name ?? 'Unknown',
      player_count: players.length,
    }
  })
}
