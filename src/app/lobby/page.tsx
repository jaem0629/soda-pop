import { getAuthUser } from '@/app/_lib/queries'
import { getMatchRoute } from '@/app/_lib/routing'
import { redirect } from 'next/navigation'
import { getActiveMatch, getLeaderboard, getUserProfile } from './_lib/queries'
import { Lobby } from './lobby'
export default async function LobbyPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect('/')
  }

  const [activeMatch, profile, soloLeaderboard, battleLeaderboard] =
    await Promise.all([
      getActiveMatch(user.id),
      getUserProfile(user.id),
      getLeaderboard('solo'),
      getLeaderboard('battle'),
    ])

  if (activeMatch) {
    redirect(getMatchRoute(activeMatch.id, activeMatch.status))
  }

  const nickname = profile?.username ?? 'Unknown'

  return (
    <Lobby
      nickname={nickname}
      soloLeaderboard={soloLeaderboard}
      battleLeaderboard={battleLeaderboard}
    />
  )
}
