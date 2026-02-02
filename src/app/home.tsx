'use client'

import { Footer } from '@/app/_components/footer'
import { Separator } from '@/components/ui/separator'
import { Gamepad2Icon, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRef, useState, useTransition } from 'react'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { signInAsGuest } from './actions'

// Lazy load heavy components (below the fold)
const Turnstile = dynamic(
    () => import('@marsidev/react-turnstile').then((mod) => mod.Turnstile),
    { ssr: false }
)
const MatchCard = dynamic(() =>
    import('./_components/match-card').then((mod) => ({ default: mod.MatchCard }))
)
const PopCard = dynamic(() =>
    import('./_components/pop-card').then((mod) => ({ default: mod.PopCard }))
)
const WinCard = dynamic(() =>
    import('./_components/win-card').then((mod) => ({ default: mod.WinCard }))
)

export function Home() {
    const [isPending, startTransition] = useTransition()
    const [captchaToken, setCaptchaToken] = useState<string | null>(null)
    const [showTurnstile, setShowTurnstile] = useState(false)
    const turnstileRef = useRef<TurnstileInstance | null>(null)

    const handleStartPlaying = () => {
        if (!captchaToken) {
            // Show Turnstile on first click
            setShowTurnstile(true)
            return
        }

        startTransition(async () => {
            const randomNum = Math.floor(Math.random() * 10000)
            const randomNickname = `Guest_${randomNum.toString().padStart(4, '0')}`
            await signInAsGuest(randomNickname, captchaToken)
        })
    }

    const handleTurnstileVerify = (token: string) => {
        setCaptchaToken(token)
    }

    const handleTurnstileError = () => {
        console.error('Turnstile verification failed')
        setCaptchaToken(null)
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

                    {/* Turnstile - loads only when button is clicked */}
                    {showTurnstile && (
                        <div className='mt-4'>
                            <Turnstile
                                ref={turnstileRef}
                                siteKey={
                                    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!
                                }
                                onSuccess={handleTurnstileVerify}
                                onError={handleTurnstileError}
                            />
                        </div>
                    )}
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
