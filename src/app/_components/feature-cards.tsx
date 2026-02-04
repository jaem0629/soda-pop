import { Card, CardContent } from '@/components/ui/card'

export function MatchCard() {
    return (
        <Card className='h-full w-full max-w-xs rounded-4xl px-4 py-8'>
            <CardContent className='flex flex-col items-center gap-4 text-center'>
                <div className='flex h-32 w-32 items-center justify-center rounded-xl'>
                    <div className='grid grid-cols-4 gap-1.5'>
                        <div className='size-5 rounded-full bg-red-500' />
                        <div className='size-5 rounded-full bg-amber-500' />
                        <div className='size-5 rounded-full bg-red-500' />
                        <div className='size-5 rounded-full bg-amber-500' />
                        <div className='size-5 animate-pulse rounded-full bg-cyan-400 ring-2 ring-cyan-300' />
                        <div className='size-5 animate-pulse rounded-full bg-cyan-400 ring-2 ring-cyan-300' />
                        <div className='size-5 animate-pulse rounded-full bg-cyan-400 ring-2 ring-cyan-300' />
                        <div className='size-5 rounded-full bg-red-500' />
                        <div className='size-5 rounded-full bg-amber-500' />
                        <div className='size-5 rounded-full bg-red-500' />
                        <div className='size-5 rounded-full bg-amber-500' />
                        <div className='size-5 rounded-full bg-cyan-400' />
                        <div className='size-5 rounded-full bg-red-500' />
                        <div className='size-5 rounded-full bg-cyan-400' />
                        <div className='size-5 rounded-full bg-red-500' />
                        <div className='size-5 rounded-full bg-amber-500' />
                    </div>
                </div>
                <h3 className='text-3xl font-bold'>MATCH</h3>
                <p className='text-muted-foreground text-sm'>
                    Connect 3+ bubbles of the same color.
                </p>
            </CardContent>
        </Card>
    )
}

export function PopCard() {
    return (
        <Card className='h-full w-full max-w-xs rounded-4xl px-4 py-8'>
            <CardContent className='flex flex-col items-center gap-4 text-center'>
                <div className='relative flex h-32 w-32 items-center justify-center rounded-xl'>
                    <div className='grid grid-cols-4 gap-1.5'>
                        <div className='size-5 rounded-full bg-red-500 opacity-50' />
                        <div className='size-5 rounded-full bg-amber-500 opacity-30' />
                        <div className='size-5 rounded-full bg-red-500 opacity-40' />
                        <div className='size-5 rounded-full bg-amber-500 opacity-20' />
                        <div className='size-5 rounded-full bg-cyan-400 opacity-30' />
                        <div className='size-5 rounded-full opacity-0' />
                        <div className='size-5 rounded-full opacity-0' />
                        <div className='size-5 rounded-full bg-red-500 opacity-20' />
                        <div className='size-5 rounded-full bg-amber-500 opacity-20' />
                        <div className='size-5 rounded-full opacity-0' />
                        <div className='size-5 rounded-full opacity-0' />
                        <div className='size-5 rounded-full bg-cyan-400 opacity-40' />
                        <div className='size-5 rounded-full bg-red-500 opacity-50' />
                        <div className='size-5 rounded-full bg-cyan-400 opacity-30' />
                        <div className='size-5 rounded-full bg-red-500 opacity-40' />
                        <div className='size-5 rounded-full bg-amber-500 opacity-30' />
                    </div>
                    <div className='animate-scale-pulse absolute text-7xl'>
                        💥
                    </div>
                </div>
                <h3 className='text-3xl font-bold'>POP</h3>
                <p className='text-muted-foreground text-sm'>
                    Watch them explode and chain react.
                </p>
            </CardContent>
        </Card>
    )
}

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
