'use client'

import { GameProvider } from '@/contexts/game-context'

export default function GameLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <GameProvider>
            <div className='relative flex min-h-svh flex-col overflow-hidden bg-[#0B1120] text-white'>
                <div className='relative z-10 flex flex-1 flex-col'>
                    {children}
                </div>
            </div>
        </GameProvider>
    )
}
