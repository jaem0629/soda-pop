'use client'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

type WaitingRoomProps = {
    code: string | null
    hasOpponent: boolean
    isHost: boolean
    canStart: boolean
    onStartGame: () => void
}

export default function WaitingRoom({
    code,
    hasOpponent,
    isHost,
    canStart,
    onStartGame,
}: WaitingRoomProps) {
    return (
        <Card className='w-full max-w-md'>
            <CardHeader className='text-center'>
                <CardTitle>방 코드</CardTitle>
                <CardDescription>
                    이 코드를 상대방에게 공유하세요
                </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col items-center gap-6'>
                <p className='text-primary text-5xl font-bold tracking-[0.3em]'>
                    {code ?? '---'}
                </p>

                {!hasOpponent && (
                    <div className='text-muted-foreground flex items-center gap-2'>
                        <div className='border-primary size-4 animate-spin rounded-full border-2 border-t-transparent' />
                        상대방 대기 중...
                    </div>
                )}

                {canStart && (
                    <Button onClick={onStartGame} size='lg' className='w-full'>
                        게임 시작!
                    </Button>
                )}

                {hasOpponent && !isHost && (
                    <p className='text-muted-foreground'>
                        방장이 게임을 시작합니다...
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
