import { getServerUserId } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import { getMatch, getPlayerByUserId } from '../_lib/queries'
import MatchWaiting from './match-waiting'

interface Props {
  params: Promise<{ matchId: string }>
}

export default async function WaitingPage({ params }: Props) {
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
  if (match.status !== 'waiting' && match.status !== 'matching') {
    redirect(`/game/${matchId}`)
  }

  return (
    <MatchWaiting
      matchId={matchId}
      userId={userId}
      initialMatch={match}
      initialPlayer={player!}
    />
  )
}
