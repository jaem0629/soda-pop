'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
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
        <Card className='mb-4 w-full max-w-2xl py-4'>
            <CardContent className='flex items-center justify-between px-6 py-0'>
                <div className='text-center'>
                    <p className='text-muted-foreground text-xs'>나</p>
                    <p className='font-semibold'>{myNickname}</p>
                    <p className='text-chart-5 text-2xl font-bold tabular-nums'>
                        {myScore}
                    </p>
                </div>

                <div className='text-center'>
                    {status === 'waiting' && (
                        <p className='text-muted-foreground'>대기 중</p>
                    )}
                    {status === 'matching' && (
                        <p className='text-muted-foreground'>매칭 중</p>
                    )}
                    {status === 'playing' && !isFinished && (
                        <p
                            className={cn(
                                'text-4xl font-bold tabular-nums',
                                timeLeft <= 10
                                    ? 'text-destructive animate-pulse'
                                    : 'text-foreground'
                            )}>
                            {timeLeft}
                        </p>
                    )}
                    {(isFinished || status === 'abandoned') && (
                        <p className='text-primary text-2xl font-bold'>종료!</p>
                    )}
                </div>

                <div className='text-center'>
                    <p className='text-muted-foreground text-xs'>상대</p>
                    <p className='font-semibold'>{opponentName ?? '???'}</p>
                    <p className='text-chart-4 text-2xl font-bold tabular-nums'>
                        {opponentScore}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
