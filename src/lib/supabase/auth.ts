import { createSupabaseServerClient } from './server'
import type { User } from '@supabase/supabase-js'

export const USERNAME_MAX_LENGTH = 20
const FALLBACK_USERNAME = 'Player'
const SAFE_USERNAME_PATTERN = /[^0-9A-Za-z_가-힣]/g

export function normalizeUsername(value: string | null | undefined): string {
  const normalized = (value ?? '')
    .replace(SAFE_USERNAME_PATTERN, '')
    .slice(0, USERNAME_MAX_LENGTH)

  return normalized || FALLBACK_USERNAME
}

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
