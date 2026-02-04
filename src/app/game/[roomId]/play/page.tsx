import { getServerUserId } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import { getMatch, getPlayerByUserId } from '../_lib/queries'
import { GAME_DURATION } from '../_lib/game-logic'
import { calculateTimeLeft } from '../_lib/utils'
import PlayRoom from './play-room'

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
        <PlayRoom
            matchId={roomId}
            userId={userId}
            initialMatch={match}
            initialPlayer={player!}
            initialOpponent={opponent}
            initialTimeLeft={initialTimeLeft}
        />
    )
}
