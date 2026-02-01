'use client'

import { useSingleConnection } from '@/hooks/use-single-connection'
import type { ReactNode } from 'react'

interface SingleConnectionGuardProps {
    roomId: string
    userId: string
    children: ReactNode
}

export function SingleConnectionGuard({
    roomId,
    userId,
    children,
}: SingleConnectionGuardProps) {
    const { isDuplicate, isChecking } = useSingleConnection(roomId, userId)

    if (isChecking) {
        return (
            <div className='flex min-h-screen flex-col items-center justify-center bg-[#0B1120]'>
                <div className='size-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent' />
            </div>
        )
    }

    if (isDuplicate) {
        return (
            <div className='flex min-h-screen flex-col items-center justify-center bg-[#0B1120] p-6 text-center'>
                <div className='max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-8'>
                    <div className='mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-500/20'>
                        <svg
                            className='size-8 text-red-400'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'>
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                            />
                        </svg>
                    </div>
                    <h2 className='mb-2 text-xl font-bold text-white'>
                        이미 다른 곳에서 게임 중입니다
                    </h2>
                    <p className='mb-6 text-slate-400'>
                        동일한 게임방에 중복 접속할 수 없습니다. 기존 연결에서
                        게임을 계속해주세요.
                    </p>
                    <button
                        onClick={() => window.close()}
                        className='rounded-lg bg-red-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-red-600'>
                        닫기
                    </button>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
