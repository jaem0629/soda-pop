import { getMatch, getPlayerByUserId } from '@/lib/match'
import { getServerUserId } from '@/lib/auth'
import { redirect } from 'next/navigation'
import WaitingClient from './waiting-client'

interface Props {
    params: Promise<{ roomId: string }>
}

export default async function WaitingPage({ params }: Props) {
    const { roomId } = await params

    // Get userId from auth (layout already validated)
    const userId = await getServerUserId()
    if (!userId) {
        redirect('/')
    }

    // Get data (layout already validated, but we need it)
    const [player, match] = await Promise.all([
        getPlayerByUserId(roomId, userId),
        getMatch(roomId),
    ])

    // If status doesn't match, let index router handle it
    if (match?.status !== 'waiting' && match?.status !== 'matching') {
        redirect(`/game/${roomId}`)
    }

    return (
        <WaitingClient
            matchId={roomId}
            userId={userId}
            initialMatch={match}
            initialPlayer={player!}
        />
    )
}
