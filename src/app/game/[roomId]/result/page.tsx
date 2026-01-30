import { getMatch, getPlayerByUserId } from '@/lib/match'
import { getServerUserId } from '@/lib/auth'
import { redirect } from 'next/navigation'
import GameResult from './game-result'

interface Props {
    params: Promise<{ roomId: string }>
}

export default async function ResultPage({ params }: Props) {
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
    if (match?.status !== 'finished') {
        redirect(`/game/${roomId}`)
    }

    const opponent = match.players.find((p) => p.user_id !== userId)

    return (
        <GameResult
            myPlayer={player!}
            opponent={opponent}
            myScore={player!.score}
            opponentScore={opponent?.score ?? 0}
        />
    )
}
