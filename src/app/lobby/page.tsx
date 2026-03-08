import { getMatchRoute } from '@/app/_lib/routing'
import { getAuthUser } from '@/app/_lib/queries'
import { redirect } from 'next/navigation'
import { getActiveMatch, getUserProfile, getWaitingRooms } from './_lib/queries'
import { Lobby } from './lobby'

export default async function LobbyPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect('/')
  }

  const [activeMatch, profile, rooms] = await Promise.all([
    getActiveMatch(user.id),
    getUserProfile(user.id),
    getWaitingRooms(),
  ])

  if (activeMatch) {
    redirect(getMatchRoute(activeMatch.id, activeMatch.status))
  }

  const nickname = profile?.username ?? 'Unknown'

  return <Lobby nickname={nickname} rooms={rooms} />
}
