'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signInAsGuest(
  nickname: string,
  captchaToken: string,
): Promise<{ success: boolean; error?: string }> {
  const trimmed = nickname.trim()
  if (trimmed.length === 0 || trimmed.length > 20) {
    return { success: false, error: 'Nickname must be 1-20 characters' }
  }

  const supabase = await createSupabaseServerClient()

  let {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const { data, error } = await supabase.auth.signInAnonymously({
      options: {
        captchaToken: captchaToken,
      },
    })
    if (error || !data.user) {
      console.error('Anonymous sign-in failed:', error)
      return { success: false, error: 'Sign-in failed' }
    }
    user = data.user
  }

  const { data: banned } = await supabase.rpc('is_banned_word', {
    input: trimmed,
  })
  if (banned) {
    return { success: false, error: 'Nickname contains inappropriate language' }
  }

  const { error: profileError } = await supabase.from('users').upsert(
    {
      id: user.id,
      username: trimmed,
    },
    {
      onConflict: 'id',
    },
  )

  if (profileError) {
    console.error('User profile creation failed:', profileError)
    if (profileError.code === '23505') {
      return { success: false, error: 'Nickname already taken' }
    }
    return { success: false, error: 'Profile creation failed' }
  }

  return { success: true }
}

export async function updateNickname(
  newNickname: string,
): Promise<{ success: boolean; error?: string }> {
  const trimmed = newNickname.trim()
  if (trimmed.length === 0 || trimmed.length > 20) {
    return { success: false, error: 'Nickname must be 1-20 characters' }
  }

  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: banned } = await supabase.rpc('is_banned_word', {
    input: trimmed,
  })
  if (banned) {
    return { success: false, error: 'Nickname contains inappropriate language' }
  }

  const { error } = await supabase
    .from('users')
    .update({ username: trimmed })
    .eq('id', user.id)

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Nickname already taken' }
    }
    console.error('Nickname update failed:', error)
    return { success: false, error: 'Update failed' }
  }

  return { success: true }
}

export async function checkNicknameAvailable(
  nickname: string,
): Promise<{ available: boolean; reason?: 'taken' | 'banned' }> {
  const trimmed = nickname.trim()
  if (trimmed.length === 0) return { available: false }

  const supabase = await createSupabaseServerClient()

  const { data: banned } = await supabase.rpc('is_banned_word', {
    input: trimmed,
  })
  if (banned) return { available: false, reason: 'banned' }

  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('username', trimmed)
    .maybeSingle()

  return { available: !data, reason: data ? 'taken' : undefined }
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/')
}
