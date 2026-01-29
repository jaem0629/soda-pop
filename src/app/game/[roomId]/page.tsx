'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function GameRoomPage() {
    const params = useParams()
    const router = useRouter()
    const roomId = params.roomId as string

    useEffect(() => {
        // Redirect to waiting page
        router.replace(`/game/${roomId}/waiting`)
    }, [roomId, router])

    return (
        <div className='flex min-h-svh items-center justify-center'>
            <div className='flex items-center gap-2 text-slate-400'>
                <div className='size-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent' />
                <span>Loading...</span>
            </div>
        </div>
    )
}
