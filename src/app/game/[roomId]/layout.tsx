import { getServerUserId } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import { SingleConnectionGuard } from './_components/single-connection-guard'
import { getMatch, getPlayerByUserId } from './_lib/queries'

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

    // Run validation queries in parallel
    const [player, match] = await Promise.all([
        getPlayerByUserId(roomId, userId),
        getMatch(roomId),
    ])

    // Validate player exists and belongs to this match
    if (!player) {
        redirect('/')
    }

    // Validate match exists and is not abandoned
    if (!match || match.status === 'abandoned') {
        redirect('/')
    }

    return (
        <SingleConnectionGuard userId={userId}>
            {children}
        </SingleConnectionGuard>
    )
}
