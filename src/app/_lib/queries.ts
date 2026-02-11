import { createSupabaseServerClient } from '@/lib/supabase/server'

/** Get authenticated user or null */
export async function getAuthUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/** Get current authenticated user with profile, or null */
export async function getCurrentUser() {
  try {
    const user = await getAuthUser()
    if (!user) return null

    const supabase = await createSupabaseServerClient()
    const { data: profile } = await supabase
      .from('users')
      .select('username')
      .eq('id', user.id)
      .single()

    return { nickname: profile?.username ?? 'Unknown' }
  } catch {
    return null
  }
}
