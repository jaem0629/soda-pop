'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

type GameResultProps = {
    myNickname: string
    myScore: number
    opponentName: string | null | undefined
    opponentScore: number
    onGoHome: () => void
}

export default function GameResult({
    myNickname,
    myScore,
    opponentName,
    opponentScore,
    onGoHome,
}: GameResultProps) {
    const result =
        myScore > opponentScore
            ? '🎉 승리!'
            : myScore < opponentScore
              ? '😢 패배'
              : '🤝 무승부'

    return (
        <Card className='w-full max-w-md'>
            <CardHeader className='text-center'>
                <CardTitle className='text-3xl'>{result}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='flex items-center justify-center gap-8'>
                    <div className='text-center'>
                        <p className='text-muted-foreground text-sm'>
                            {myNickname}
                        </p>
                        <p className='text-chart-5 text-4xl font-bold tabular-nums'>
                            {myScore}
                        </p>
                    </div>
                    <div className='text-muted-foreground text-2xl font-bold'>
                        vs
                    </div>
                    <div className='text-center'>
                        <p className='text-muted-foreground text-sm'>
                            {opponentName ?? '???'}
                        </p>
                        <p className='text-chart-4 text-4xl font-bold tabular-nums'>
                            {opponentScore}
                        </p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={onGoHome} className='w-full' size='lg'>
                    메인으로
                </Button>
            </CardFooter>
        </Card>
    )
}
