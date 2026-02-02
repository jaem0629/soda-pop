'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { Turnstile } from '@marsidev/react-turnstile'
import { Gamepad2Icon, Loader2 } from 'lucide-react'
import { useRef, useState, useTransition } from 'react'
import { signInAsGuest } from '../actions'

export function LoginDialog() {
    const [isPending, startTransition] = useTransition()
    const [captchaToken, setCaptchaToken] = useState<string | null>(null)
    const [showGuestLogin, setShowGuestLogin] = useState(false)
    const turnstileRef = useRef<TurnstileInstance | null>(null)

    const handleGuestLogin = () => {
        setShowGuestLogin(true)
    }

    const handleGuestSignIn = () => {
        if (!captchaToken) {
            return
        }

        startTransition(async () => {
            const randomNum = Math.floor(Math.random() * 10000)
            const randomNickname = `Guest_${randomNum.toString().padStart(4, '0')}`
            await signInAsGuest(randomNickname, captchaToken)
        })
    }

    const handleSSOLogin = () => {
        // TODO: Implement SSO login
        alert('SSO login coming soon!')
    }

    const handleTurnstileVerify = (token: string) => {
        setCaptchaToken(token)
    }

    const handleTurnstileError = () => {
        // Silently handle error (expected in Lighthouse/automated tests)
        setCaptchaToken(null)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className='flex items-center gap-4 rounded-full bg-blue-600 px-8 py-4 text-lg font-bold transition-colors hover:bg-blue-500'>
                    <Gamepad2Icon />
                    Start Playing
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Choose how to play</DialogTitle>
                    <DialogDescription>
                        Sign in with your account or continue as a guest
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-4'>
                    {!showGuestLogin ? (
                        <>
                            {/* SSO Login Button (Disabled) */}
                            <button
                                onClick={handleSSOLogin}
                                disabled
                                className='flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800 px-6 py-3 font-medium transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50'>
                                <svg className='h-5 w-5' viewBox='0 0 24 24'>
                                    <path
                                        fill='currentColor'
                                        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                                    />
                                    <path
                                        fill='currentColor'
                                        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                                    />
                                    <path
                                        fill='currentColor'
                                        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                                    />
                                    <path
                                        fill='currentColor'
                                        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                                    />
                                </svg>
                                Continue with Google
                                <span className='text-muted-foreground ml-auto text-xs'>
                                    Coming soon
                                </span>
                            </button>

                            {/* Guest Login Button */}
                            <button
                                onClick={handleGuestLogin}
                                className='flex w-full items-center justify-center gap-3 rounded-lg bg-blue-600 px-6 py-3 font-medium transition-colors hover:bg-blue-500'>
                                <Gamepad2Icon className='h-5 w-5' />
                                Continue as Guest
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Turnstile Verification */}
                            <div className='space-y-4'>
                                <p className='text-muted-foreground text-center text-sm'>
                                    Please verify you&apos;re human
                                </p>
                                <div className='flex justify-center'>
                                    <Turnstile
                                        ref={turnstileRef}
                                        siteKey={
                                            process.env
                                                .NEXT_PUBLIC_TURNSTILE_SITE_KEY!
                                        }
                                        onSuccess={handleTurnstileVerify}
                                        onError={handleTurnstileError}
                                    />
                                </div>
                                <button
                                    onClick={handleGuestSignIn}
                                    disabled={isPending || !captchaToken}
                                    className='flex w-full items-center justify-center gap-3 rounded-lg bg-blue-600 px-6 py-3 font-medium transition-colors hover:bg-blue-500 disabled:opacity-50'>
                                    {isPending ? (
                                        <Loader2 className='h-5 w-5 animate-spin' />
                                    ) : (
                                        <Gamepad2Icon className='h-5 w-5' />
                                    )}
                                    Start Playing
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
