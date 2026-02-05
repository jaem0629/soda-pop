import { getMatchRoute } from '@/app/_lib/routing'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getActiveMatch, getAuthUser, getUserProfile } from './_lib/queries'
import { Lobby } from './lobby'

export default async function LobbyPage() {
  const supabase = await createSupabaseServerClient()
  const user = await getAuthUser(supabase)

  if (!user) {
    redirect('/')
  }

  // Run queries in parallel
  const [activeMatch, profile] = await Promise.all([
    getActiveMatch(supabase, user.id),
    getUserProfile(supabase, user.id),
  ])

  if (activeMatch) {
    redirect(getMatchRoute(activeMatch.id, activeMatch.status))
  }

  const nickname = profile?.username ?? 'Unknown'

  return <Lobby nickname={nickname} />
}
