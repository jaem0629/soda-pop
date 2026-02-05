import { getMatchRoute } from '@/app/_lib/routing'
import { redirect } from 'next/navigation'
import { getMatch } from './_lib/queries'

interface Props {
  params: Promise<{ roomId: string }>
}

export default async function GameRoomPage({ params }: Props) {
  const { roomId } = await params

  // userId is validated by layout, only check match here
  const match = await getMatch(roomId)

  if (!match) {
    redirect('/')
  }

  redirect(getMatchRoute(roomId, match.status))
}
