import { getMatch, getPlayerByUserId } from '@/lib/match'
import { getServerUserId } from '@/lib/auth'
import { redirect } from 'next/navigation'

interface Props {
    children: React.ReactNode
    params: Promise<{ roomId: string }>
}

export default async function GameLayout({ children, params }: Props) {
    const { roomId } = await params

    // Get userId from auth session
    const userId = await getServerUserId()
    if (!userId) {
        redirect('/')
    }

    // Validate player exists and belongs to this match
    const player = await getPlayerByUserId(roomId, userId)
    if (!player) {
        redirect('/')
    }

    // Validate match exists and is not abandoned
    const match = await getMatch(roomId)
    if (!match || match.status === 'abandoned') {
        redirect('/')
    }

    return <>{children}</>
}
