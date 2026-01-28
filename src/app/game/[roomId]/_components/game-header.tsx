'use client'

import { MatchStatus } from '@/lib/match'

type GameHeaderProps = {
    myNickname: string
    myScore: number
    opponentName: string | null
    opponentScore: number
    timeLeft: number
    status: MatchStatus
    isFinished: boolean
}

export default function GameHeader({
    myNickname,
    myScore,
    opponentName,
    opponentScore,
    timeLeft,
    status,
    isFinished,
}: GameHeaderProps) {
    return (
        <div className='mb-4 w-full max-w-2xl'>
            <div className='flex items-center justify-between rounded-xl bg-[#1a1a2e] p-4'>
                <div className='text-center'>
                    <p className='text-sm text-gray-400'>나</p>
                    <p className='font-bold text-white'>{myNickname}</p>
                    <p className='text-2xl font-bold text-yellow-400'>
                        {myScore}
                    </p>
                </div>

                <div className='text-center'>
                    {status === 'waiting' && (
                        <p className='text-gray-400'>대기 중</p>
                    )}
                    {status === 'matching' && (
                        <p className='text-gray-400'>매칭 중</p>
                    )}
                    {status === 'playing' && !isFinished && (
                        <p
                            className={`text-4xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-white'}`}>
                            {timeLeft}
                        </p>
                    )}
                    {(isFinished || status === 'abandoned') && (
                        <p className='text-2xl font-bold text-purple-400'>
                            종료!
                        </p>
                    )}
                </div>

                <div className='text-center'>
                    <p className='text-sm text-gray-400'>상대</p>
                    <p className='font-bold text-white'>
                        {opponentName ?? '???'}
                    </p>
                    <p className='text-2xl font-bold text-pink-400'>
                        {opponentScore}
                    </p>
                </div>
            </div>
        </div>
    )
}
