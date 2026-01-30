import {
    calculateTimeLeft,
    GAME_DURATION,
    getMatch,
    getPlayerByUserId,
} from '@/lib/match'
import { getServerUserId } from '@/lib/auth'
import { redirect } from 'next/navigation'
import PlayClient from './play-client'

interface Props {
    params: Promise<{ roomId: string }>
}

export default async function PlayPage({ params }: Props) {
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
    if (match?.status !== 'playing') {
        redirect(`/game/${roomId}`)
    }

    const initialTimeLeft = match.started_at
        ? calculateTimeLeft(match.started_at, GAME_DURATION)
        : GAME_DURATION

    const opponent = match.players.find((p) => p.user_id !== userId)

    return (
        <PlayClient
            matchId={roomId}
            userId={userId}
            initialMatch={match}
            initialPlayer={player!}
            initialOpponent={opponent}
            initialTimeLeft={initialTimeLeft}
        />
    )
}
