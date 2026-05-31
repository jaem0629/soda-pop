import { normalizeUsername, USERNAME_MAX_LENGTH } from '@/lib/supabase/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

const DEFAULT_REDIRECT_PATH = '/lobby'
const ERROR_REDIRECT_PATH = '/'

function getPreferredUsername(user: User): string {
  const metadata = user.user_metadata
  const nickname =
    typeof metadata.nickname === 'string' ? metadata.nickname : undefined
  const fullName =
    typeof metadata.full_name === 'string' ? metadata.full_name : undefined
  const name = typeof metadata.name === 'string' ? metadata.name : undefined
  const emailName = user.email?.split('@')[0]

  return normalizeUsername(nickname ?? fullName ?? name ?? emailName)
}

function buildUsernameCandidates(user: User): string[] {
  const base = getPreferredUsername(user)
  const suffix = user.id.replaceAll('-', '').slice(0, 6)
  const suffixedBase = base.slice(
    0,
    Math.max(1, USERNAME_MAX_LENGTH - suffix.length - 1),
  )

  return [base, `${suffixedBase}_${suffix}`]
}

function getSafeRedirectPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return DEFAULT_REDIRECT_PATH
  }

  return value
}

async function ensureUserProfile(user: User): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { data: existingProfile, error: existingError } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (existingError) throw existingError
  if (existingProfile) return

  const candidates = buildUsernameCandidates(user)

  for (const username of candidates) {
    const { data: banned } = await supabase.rpc('is_banned_word', {
      input: username,
    })

    if (banned) continue

    const { error } = await supabase.from('users').upsert(
      {
        id: user.id,
        username,
      },
      {
        onConflict: 'id',
      },
    )

    if (!error) return
    if (error.code !== '23505') throw error
  }

  const fallback = `Player_${user.id.replaceAll('-', '').slice(0, 6)}`
  const { error } = await supabase.from('users').upsert(
    {
      id: user.id,
      username: fallback,
    },
    {
      onConflict: 'id',
    },
  )

  if (error) throw error
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = getSafeRedirectPath(requestUrl.searchParams.get('next'))

  if (!code) {
    return NextResponse.redirect(
      new URL(ERROR_REDIRECT_PATH, requestUrl.origin),
    )
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('OAuth callback failed:', error)
    return NextResponse.redirect(
      new URL(ERROR_REDIRECT_PATH, requestUrl.origin),
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(
      new URL(ERROR_REDIRECT_PATH, requestUrl.origin),
    )
  }

  try {
    await ensureUserProfile(user)
  } catch (profileError) {
    console.error('OAuth profile creation failed:', profileError)
    return NextResponse.redirect(
      new URL(ERROR_REDIRECT_PATH, requestUrl.origin),
    )
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
