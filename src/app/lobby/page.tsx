import { getMatchRoute } from '@/app/_lib/routing'
import { getAuthUser } from '@/app/_lib/queries'
import { redirect } from 'next/navigation'
import { getActiveMatch, getUserProfile } from './_lib/queries'
import { Lobby } from './lobby'

export default async function LobbyPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect('/')
  }

  // Run queries in parallel
  const [activeMatch, profile] = await Promise.all([
    getActiveMatch(user.id),
    getUserProfile(user.id),
  ])

  if (activeMatch) {
    redirect(getMatchRoute(activeMatch.id, activeMatch.status))
  }

  const nickname = profile?.username ?? 'Unknown'

  return <Lobby nickname={nickname} />
}
