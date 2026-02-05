import { getServerUserId } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import { getMatch, getPlayerByUserId } from '../_lib/queries'
import WaitingRoom from './waiting-room'

interface Props {
  params: Promise<{ roomId: string }>
}

export default async function WaitingPage({ params }: Props) {
  const { roomId } = await params

  // userId is validated by layout
  const userId = (await getServerUserId())!

  // Get data
  const [player, match] = await Promise.all([
    getPlayerByUserId(roomId, userId),
    getMatch(roomId),
  ])

  // Validate player and match exist
  if (!player || !match || match.status === 'abandoned') {
    redirect('/')
  }

  // If status doesn't match, let index router handle it
  if (match.status !== 'waiting' && match.status !== 'matching') {
    redirect(`/game/${roomId}`)
  }

  return (
    <WaitingRoom
      matchId={roomId}
      userId={userId}
      initialMatch={match}
      initialPlayer={player!}
    />
  )
}
