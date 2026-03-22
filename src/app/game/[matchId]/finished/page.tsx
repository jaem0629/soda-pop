import { getServerUserId } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import { getMatch, getPlayerByUserId } from '../_lib/queries'
import MatchFinished from './match-finished'

interface Props {
  params: Promise<{ matchId: string }>
}

export default async function ResultPage({ params }: Props) {
  const { matchId } = await params

  const userId = (await getServerUserId())!

  const [player, match] = await Promise.all([
    getPlayerByUserId(matchId, userId),
    getMatch(matchId),
  ])

  if (!player || !match || match.status === 'abandoned') {
    redirect('/')
  }

  if (match.status !== 'finished') {
    redirect(`/game/${matchId}`)
  }

  const opponent = match.players.find((p) => p.user_id !== userId)

  return (
    <MatchFinished
      mode={match.mode}
      myPlayer={player!}
      opponent={opponent}
      myScore={player!.score}
      opponentScore={opponent?.score ?? 0}
    />
  )
}
