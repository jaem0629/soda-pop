'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useGameContext } from '@/contexts/game-context'
import GameBoard from '@/components/game-board'
import ConnectionIndicator from '../_components/connection-indicator'

export default function PlayPage() {
    const router = useRouter()
    const params = useParams()
    const roomId = params.roomId as string

    const {
        myPlayer,
        match,
        opponent,
        isLoading,
        isConnected,
        myScore,
        opponentScore,
        timeLeft,
        gameStatus,
        isFinished,
        handleScoreChange,
    } = useGameContext()

    // Redirect based on game status
    useEffect(() => {
        if (gameStatus === 'waiting') {
            router.replace(`/game/${roomId}/waiting`)
        } else if (isFinished) {
            router.replace(`/game/${roomId}/result`)
        }
    }, [gameStatus, isFinished, roomId, router])

    if (!myPlayer || isLoading || !match) {
        return (
            <div className='flex min-h-svh items-center justify-center'>
                <div className='flex items-center gap-2 text-slate-400'>
                    <div className='size-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent' />
                    <span>Loading...</span>
                </div>
            </div>
        )
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className='flex flex-1 flex-col'>
            {/* Game Header */}
            <header className='flex items-center justify-between border-b border-white/5 bg-[#0B1120]/80 px-4 py-3 backdrop-blur-md lg:px-6'>
                {/* Left - My Score */}
                <div className='flex items-center gap-3'>
                    <div className='flex size-10 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white shadow-lg'>
                        {myPlayer.player_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className='text-sm font-medium text-slate-400'>
                            {myPlayer.player_name}
                        </p>
                        <p className='text-2xl font-black text-cyan-400 tabular-nums'>
                            {myScore.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Center - Timer */}
                <div className='flex flex-col items-center'>
                    <div
                        className={`rounded-2xl border px-6 py-2 ${
                            timeLeft <= 10
                                ? 'animate-pulse border-red-500/50 bg-red-500/20'
                                : 'border-white/10 bg-[#162032]'
                        }`}>
                        <p
                            className={`text-3xl font-black tabular-nums ${
                                timeLeft <= 10 ? 'text-red-400' : 'text-white'
                            }`}>
                            {formatTime(timeLeft)}
                        </p>
                    </div>
                    <p className='mt-1 text-xs font-bold tracking-wider text-slate-500 uppercase'>
                        Time Left
                    </p>
                </div>

                {/* Right - Opponent Score */}
                <div className='flex items-center gap-3'>
                    <div className='text-right'>
                        <p className='text-sm font-medium text-slate-400'>
                            {opponent?.player_name ?? 'Opponent'}
                        </p>
                        <p className='text-2xl font-black text-purple-400 tabular-nums'>
                            {opponentScore.toLocaleString()}
                        </p>
                    </div>
                    <div className='flex size-10 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-pink-600 text-sm font-bold text-white shadow-lg'>
                        {opponent?.player_name?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                </div>
            </header>

            {/* Score Comparison Bar */}
            <div className='border-b border-white/5 bg-[#162032]/50 px-4 py-2'>
                <div className='flex h-3 overflow-hidden rounded-full bg-slate-800'>
                    <div
                        className='bg-linear-to-r from-cyan-500 to-cyan-400 transition-all duration-300'
                        style={{
                            width: `${Math.max(5, (myScore / (myScore + opponentScore || 1)) * 100)}%`,
                        }}
                    />
                    <div
                        className='bg-linear-to-r from-purple-400 to-purple-500 transition-all duration-300'
                        style={{
                            width: `${Math.max(5, (opponentScore / (myScore + opponentScore || 1)) * 100)}%`,
                        }}
                    />
                </div>
            </div>

            {/* Game Board */}
            <main className='flex flex-1 items-center justify-center p-4'>
                <GameBoard
                    onScoreChange={handleScoreChange}
                    disabled={false}
                    initialScore={myScore}
                />
            </main>

            <ConnectionIndicator isConnected={isConnected} />
        </div>
    )
}
