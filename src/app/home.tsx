'use client'

import { Footer } from '@/app/_components/footer'
import { Separator } from '@/components/ui/separator'
import { Gamepad2Icon, Loader2 } from 'lucide-react'
import { useTransition } from 'react'
import { MatchCard } from './_components/match-card'
import { PopCard } from './_components/pop-card'
import { WinCard } from './_components/win-card'
import { signInAsGuest } from './actions'

export function Home() {
    const [isPending, startTransition] = useTransition()

    const handleStartPlaying = () => {
        startTransition(async () => {
            const randomNum = Math.floor(Math.random() * 10000)
            const randomNickname = `Guest_${randomNum.toString().padStart(4, '0')}`
            await signInAsGuest(randomNickname)
        })
    }

    return (
        <main className='flex flex-1 flex-col items-center justify-center py-16'>
            <div className='flex w-full flex-col items-center gap-16'>
                <div className='flex flex-col items-center gap-8 text-center'>
                    <h1 className='bg-linear-to-b from-white to-blue-400 bg-clip-text text-9xl font-bold text-transparent'>
                        SODA POP
                    </h1>

                    <p className='text-muted-foreground max-w-lg text-xl'>
                        Connect, pop, and compete. Match colorful bubbles in
                        real-time battles against friends.
                    </p>

                    <button
                        onClick={handleStartPlaying}
                        disabled={isPending}
                        className='flex items-center gap-4 rounded-full bg-blue-600 px-8 py-4 text-lg font-bold transition-colors hover:bg-blue-500 disabled:opacity-50'>
                        {isPending ? (
                            <Loader2 className='animate-spin' />
                        ) : (
                            <Gamepad2Icon />
                        )}
                        Start Playing
                    </button>
                </div>

                <div className='mt-16 w-full'>
                    <h2 className='text-muted-foreground mb-8 text-center font-semibold tracking-widest'>
                        HOW TO PLAY
                    </h2>

                    <div className='grid grid-cols-1 place-items-center gap-8 lg:grid-cols-3'>
                        <MatchCard />
                        <PopCard />
                        <WinCard />
                    </div>
                </div>

                <Separator />

                <Footer
                    privacyPolicyUrl='#'
                    termsOfServiceUrl='#'
                    contactUrl='#'
                />
            </div>
        </main>
    )
}
