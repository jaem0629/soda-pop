'use client'

import { Footer } from '@/components/footer'
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
    ArrowUpRightIcon,
    CircleDollarSignIcon,
    PlayCircleIcon,
    SquareDashedIcon,
} from 'lucide-react'
import Link from 'next/link'

interface HowToPlayCardProps {
    icon: React.ReactNode
    title: string
    description: string
    gradient: string
}

function HowToPlayCard({
    icon,
    title,
    description,
    gradient,
}: HowToPlayCardProps) {
    return (
        <Card className='group relative rounded-4xl p-8 transition-all hover:-translate-y-4 hover:scale-105'>
            <CardContent className='relative flex flex-col items-center gap-4 text-center'>
                <div
                    className={`mb-4 flex size-32 items-center justify-center rounded-2xl shadow-lg ${gradient}`}>
                    {icon}
                </div>
                <CardTitle className='text-xl font-bold'>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardContent>
        </Card>
    )
}

export default function Home() {
    return (
        <main className='relative flex flex-col items-center justify-center py-16'>
            <div className='flex w-full flex-col items-center gap-16'>
                {/* Hero Section */}
                <div className='flex flex-col items-center text-center'>
                    <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] backdrop-blur-sm'>
                        <CircleDollarSignIcon className='size-4' />
                        Real-time Multiplayer
                    </div>

                    <h1 className='mb-6 bg-linear-to-br from-white via-blue-200 to-cyan-400 bg-clip-text text-6xl leading-[0.9] font-black tracking-tighter text-transparent drop-shadow-2xl sm:text-7xl lg:text-8xl'>
                        SODA POP
                    </h1>

                    <p className='max-w-lg text-lg leading-relaxed font-medium text-slate-400 sm:text-xl'>
                        Connect, pop, and compete. Match colorful bubbles in
                        real-time battles against friends.
                    </p>

                    <div className='mt-10 flex w-full max-w-xs flex-col items-center gap-4'>
                        <Link
                            href='/lobby'
                            className='group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-cyan-400 font-bold text-slate-900 shadow-[0_0_30px_rgba(34,211,238,0.5)] ring-4 ring-transparent transition-all hover:scale-105 hover:ring-cyan-400/20'>
                            <PlayCircleIcon className='size-6' />
                            <span className='text-lg tracking-tight'>
                                Start Playing
                            </span>
                        </Link>

                        <button className='flex items-center gap-2 rounded-full border border-white/10 px-6 py-2 text-sm font-semibold text-slate-400 transition-all hover:border-white/30 hover:bg-white/5 hover:text-white'>
                            <PlayCircleIcon className='size-4' />
                            <span>Play as Guest</span>
                        </button>
                    </div>
                </div>

                {/* How to Play Section */}
                <div className='mt-16 w-full'>
                    <div className='mb-12 flex items-center justify-center gap-4'>
                        <div className='h-px w-12 bg-linear-to-r from-transparent to-cyan-400/50' />
                        <h2 className='text-2xl font-black tracking-widest text-white/90 uppercase sm:text-3xl'>
                            How to Play
                        </h2>
                        <div className='h-px w-12 bg-linear-to-l from-transparent to-cyan-400/50' />
                    </div>

                    <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
                        <HowToPlayCard
                            icon={<SquareDashedIcon className='size-8' />}
                            title='1. Match'
                            description='Find and connect 3 or more bubbles of the same color to prime them for popping.'
                            gradient='bg-gradient-to-br from-cyan-500 to-blue-600'
                        />

                        <HowToPlayCard
                            icon={<ArrowUpRightIcon className='size-8' />}
                            title='2. Pop'
                            description='Watch them explode! Clear space on the grid and trigger fizzy chain reactions.'
                            gradient='bg-gradient-to-br from-yellow-500 to-orange-500'
                        />

                        <HowToPlayCard
                            icon={<ArrowUpRightIcon className='size-8' />}
                            title='3. Win'
                            description='Rack up high scores, unlock rewards, and dominate the Soda Pop leaderboard.'
                            gradient='bg-gradient-to-br from-purple-500 to-pink-500'
                        />
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
