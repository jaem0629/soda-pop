import { getAuthUser } from '@/app/_lib/queries'
import { getMatchRoute } from '@/app/_lib/routing'
import { redirect } from 'next/navigation'
import { getActiveMatch, getLeaderboard, getUserProfile } from './_lib/queries'
import { Lobby } from './lobby'

interface LobbyPageProps {
  searchParams?: Promise<{ leaderboard?: string }>
}

export default async function LobbyPage({ searchParams }: LobbyPageProps) {
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
  const params = await searchParams
  const isLeaderboardOpen = params?.leaderboard === '1'

  return (
    <Lobby
      nickname={nickname}
      soloLeaderboard={soloLeaderboard}
      battleLeaderboard={battleLeaderboard}
      defaultLeaderboardOpen={isLeaderboardOpen}
    />
  )
}
