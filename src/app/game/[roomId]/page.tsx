import { redirect } from 'next/navigation'

type Props = {
    params: Promise<{ roomId: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function GameRoomPage({ params, searchParams }: Props) {
    const { roomId } = await params
    const search = await searchParams
    const player = search.player

    // Preserve player query parameter
    const queryString = player ? `?player=${player}` : ''
    redirect(`/game/${roomId}/waiting${queryString}`)
}
