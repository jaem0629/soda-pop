import { GameProvider } from '@/contexts/game-context'
import { getPlayerById } from '@/lib/match'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import LoadingSpinner from './_components/loading-spinner'

type GameSearchParams = {
    playerId?: string
}

interface Props {
    children: React.ReactNode
    params: Promise<{ roomId: string }>
    searchParams: Promise<GameSearchParams>
}

export default async function GameLayout({
    children,
    params,
    searchParams,
}: Props) {
    const [{ roomId }, { playerId }] = await Promise.all([params, searchParams])

    if (!playerId) {
        redirect('/')
    }

    const player = await getPlayerById(playerId)

    if (!player || player.match_id !== roomId) {
        redirect('/')
    }

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <GameProvider initialPlayer={player}>{children}</GameProvider>
        </Suspense>
    )
}
