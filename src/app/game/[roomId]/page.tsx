import { getMatch } from '@/lib/match'
import { getServerUserId } from '@/lib/auth'
import { redirect } from 'next/navigation'

interface Props {
    params: Promise<{ roomId: string }>
}

/**
 * Index page acts as a router - redirects to the appropriate page based on match status
 */
export default async function GameRoomPage({ params }: Props) {
    const { roomId } = await params

    // Get userId from auth (layout already validated)
    const userId = await getServerUserId()

    // Get match (layout already validated it exists)
    const match = await getMatch(roomId)

    if (!match || !userId) {
        redirect('/')
    }

    // Route based on match status
    switch (match.status) {
        case 'playing':
            redirect(`/game/${roomId}/play`)
        case 'finished':
            redirect(`/game/${roomId}/result`)
        case 'waiting':
        case 'matching':
        default:
            redirect(`/game/${roomId}/waiting`)
    }
}
