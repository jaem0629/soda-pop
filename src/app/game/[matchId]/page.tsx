import { getMatchRoute } from '@/app/_lib/routing'
import { redirect } from 'next/navigation'
import { getMatch } from './_lib/queries'

interface Props {
  params: Promise<{ matchId: string }>
}

export default async function GameMatchPage({ params }: Props) {
  const { matchId } = await params

  // userId is validated by layout, only check match here
  const match = await getMatch(matchId)

  if (!match) {
    redirect('/')
  }

  redirect(getMatchRoute(matchId, match.status))
}
