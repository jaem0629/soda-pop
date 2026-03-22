import { getServerUserId } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import { getMatch, getPlayerByUserId } from '../_lib/queries'
import { GAME_DURATION } from '../_lib/game-logic'
import { calculateTimeLeft } from '../_lib/utils'
import PlayMatch from './match-playing'

interface Props {
  params: Promise<{ matchId: string }>
}

export default async function PlayPage({ params }: Props) {
  const { matchId } = await params

  const userId = (await getServerUserId())!

  const [player, match] = await Promise.all([
    getPlayerByUserId(matchId, userId),
    getMatch(matchId),
  ])

  if (!player || !match || match.status === 'abandoned') {
    redirect('/')
  }

  if (match.status !== 'playing') {
    redirect(`/game/${matchId}`)
  }

  const initialTimeLeft = match.started_at
    ? calculateTimeLeft(match.started_at, GAME_DURATION)
    : GAME_DURATION

  const opponent = match.players.find((p) => p.user_id !== userId)

  return (
    <PlayMatch
      matchId={matchId}
      userId={userId}
      mode={match.mode}
      initialMatch={match}
      initialPlayer={player!}
      initialOpponent={opponent}
      initialTimeLeft={initialTimeLeft}
    />
  )
}
