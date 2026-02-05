'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function signInAsGuest(
  nickname: string,
  captchaToken: string,
): Promise<{ success: boolean; error?: string }> {
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
    return { success: false, error: 'Profile creation failed' }
  }

  return { success: true }
}
