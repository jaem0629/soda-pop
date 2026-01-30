import { Card, CardContent } from '@/components/ui/card'

export function WinCard() {
    return (
        <Card className='h-full w-full max-w-xs rounded-4xl px-4 py-8'>
            <CardContent className='flex flex-col items-center gap-4 text-center'>
                <div className='flex h-32 w-32 items-center justify-center rounded-xl'>
                    <div className='relative'>
                        <div className='absolute inset-0 animate-pulse rounded-full bg-amber-500/50 blur-xl' />
                        <div className='relative text-6xl'>🏆</div>
                    </div>
                </div>
                <h3 className='text-3xl font-bold'>WIN</h3>
                <p className='text-muted-foreground text-sm'>
                    Outscore your opponent to win.
                </p>
            </CardContent>
        </Card>
    )
}
