import { getServerUserId } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getMatch } from './_lib/queries'

interface Props {
    params: Promise<{ roomId: string }>
}

export default async function GameRoomPage({ params }: Props) {
    const { roomId } = await params

    // Run queries in parallel
    const [userId, match] = await Promise.all([
        getServerUserId(),
        getMatch(roomId),
    ])

    if (!match || !userId) {
        redirect('/')
    }

    switch (match.status) {
        case 'playing':
            redirect(`/game/${roomId}/play`)
        case 'finished':
            redirect('/lobby')
        case 'waiting':
        case 'matching':
        default:
            redirect(`/game/${roomId}/waiting`)
    }
}
