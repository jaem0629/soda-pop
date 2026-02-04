import { createSupabaseServerClient } from './server'
import type { User } from '@supabase/supabase-js'

export async function getServerUser(): Promise<User | null> {
  const serverSupabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverSupabase.auth.getUser()
  return user
}

export async function getServerUserId(): Promise<string | null> {
  const user = await getServerUser()
  return user?.id ?? null
}
