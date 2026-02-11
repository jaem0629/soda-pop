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
