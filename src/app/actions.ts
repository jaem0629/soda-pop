'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signInAsGuest(
  nickname: string,
  captchaToken: string,
): Promise<void> {
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
      throw new Error('Sign-in failed')
    }
    user = data.user
  }

  const { error: profileError } = await supabase.from('users').upsert(
    {
      id: user.id,
      username: nickname,
    },
    {
      onConflict: 'id',
    },
  )

  if (profileError) {
    console.error('User profile creation failed:', profileError)
    throw new Error('Profile creation failed')
  }

  redirect('/lobby')
}
