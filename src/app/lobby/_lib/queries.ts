import type { SupabaseClient } from '@supabase/supabase-js'

/** Get authenticated user or null */
export async function getAuthUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/** Get user's active match (waiting or playing) */
export async function getActiveMatch(
  supabase: SupabaseClient,
  userId: string,
  excludeCode?: string,
) {
  const { data } = await supabase
    .from('matches')
    .select('id, code, match_players!inner(user_id)')
    .eq('match_players.user_id', userId)
    .in('status', ['waiting', 'playing'])
    .maybeSingle()

  if (!data) return null
  if (excludeCode && data.code === excludeCode) return null
  return data
}

/** Get user profile */
export async function getUserProfile(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from('users')
    .select('username')
    .eq('id', userId)
    .single()
  return data
}
