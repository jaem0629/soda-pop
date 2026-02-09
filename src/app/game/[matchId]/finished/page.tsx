import { getServerUserId } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import { getMatch, getPlayerByUserId } from '../_lib/queries'
import MatchFinished from './match-finished'

interface Props {
  params: Promise<{ matchId: string }>
}

export default async function ResultPage({ params }: Props) {
  const { matchId } = await params

  // userId is validated by layout
  const userId = (await getServerUserId())!

  // Get data
  const [player, match] = await Promise.all([
    getPlayerByUserId(matchId, userId),
    getMatch(matchId),
  ])

  // Validate player and match exist
  if (!player || !match || match.status === 'abandoned') {
    redirect('/')
  }

  // If status doesn't match, let index router handle it
  if (match.status !== 'finished') {
    redirect(`/game/${matchId}`)
  }

  const opponent = match.players.find((p) => p.user_id !== userId)

  return (
    <MatchFinished
      myPlayer={player!}
      opponent={opponent}
      myScore={player!.score}
      opponentScore={opponent?.score ?? 0}
    />
  )
}
