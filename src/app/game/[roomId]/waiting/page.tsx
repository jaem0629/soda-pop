'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useGameContext } from '@/contexts/game-context'
import { GlassPanel } from '@/components/glass-panel'
import { Button } from '@/components/ui/button'
import ConnectionIndicator from '../_components/connection-indicator'

export default function WaitingPage() {
    const router = useRouter()
    const params = useParams()
    const roomId = params.roomId as string

    const {
        playerInfo,
        match,
        opponent,
        isLoading,
        isConnected,
        canStart,
        gameStatus,
        handleStartGame,
    } = useGameContext()

    // Redirect if game started
    useEffect(() => {
        if (gameStatus === 'playing') {
            router.replace(`/game/${roomId}/play`)
        } else if (gameStatus === 'finished') {
            router.replace(`/game/${roomId}/result`)
        }
    }, [gameStatus, roomId, router])

    if (!playerInfo || isLoading || !match) {
        return (
            <div className='flex min-h-svh items-center justify-center'>
                <div className='flex items-center gap-2 text-slate-400'>
                    <div className='size-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent' />
                    <span>Loading...</span>
                </div>
            </div>
        )
    }

    const isHost = match.players.find(
        (p) => p.player_order === playerInfo.playerOrder
    )?.is_host

    return (
        <div className='flex flex-1 flex-col items-center justify-center p-4'>
            <GlassPanel className='w-full max-w-md p-8'>
                {/* Header */}
                <div className='mb-8 text-center'>
                    <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-sm font-bold text-cyan-400'>
                        <div className='size-2 animate-pulse rounded-full bg-cyan-400' />
                        Waiting for Players
                    </div>
                    <h1 className='text-2xl font-bold text-white'>Room Code</h1>
                </div>

                {/* Room Code */}
                <div className='mb-8 flex justify-center'>
                    <div className='rounded-2xl border border-white/10 bg-[#0B1120] px-8 py-4'>
                        <p className='text-5xl font-black tracking-[0.3em] text-cyan-400'>
                            {match.code ?? '---'}
                        </p>
                    </div>
                </div>

                {/* Players */}
                <div className='mb-8 space-y-3'>
                    <h3 className='text-sm font-bold tracking-wider text-slate-400 uppercase'>
                        Players ({match.players.length}/{match.max_players})
                    </h3>

                    {/* Player 1 (Host) */}
                    <div className='flex items-center gap-3 rounded-xl border border-white/10 bg-[#162032] p-3'>
                        <div className='flex size-10 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-blue-600 font-bold text-white'>
                            1
                        </div>
                        <div className='flex-1'>
                            <p className='font-bold text-white'>
                                {playerInfo.playerOrder === 1
                                    ? playerInfo.nickname
                                    : (opponent?.player_name ?? 'Waiting...')}
                            </p>
                            <p className='text-xs text-cyan-400'>Host</p>
                        </div>
                        <div className='size-3 rounded-full bg-green-400' />
                    </div>

                    {/* Player 2 */}
                    <div
                        className={`flex items-center gap-3 rounded-xl border p-3 ${
                            opponent || playerInfo.playerOrder === 2
                                ? 'border-white/10 bg-[#162032]'
                                : 'border-dashed border-white/20 bg-transparent'
                        }`}>
                        <div
                            className={`flex size-10 items-center justify-center rounded-full font-bold ${
                                opponent || playerInfo.playerOrder === 2
                                    ? 'bg-linear-to-br from-purple-500 to-pink-600 text-white'
                                    : 'bg-slate-800 text-slate-500'
                            }`}>
                            2
                        </div>
                        <div className='flex-1'>
                            {opponent || playerInfo.playerOrder === 2 ? (
                                <>
                                    <p className='font-bold text-white'>
                                        {playerInfo.playerOrder === 2
                                            ? playerInfo.nickname
                                            : opponent?.player_name}
                                    </p>
                                    <p className='text-xs text-slate-400'>
                                        Player
                                    </p>
                                </>
                            ) : (
                                <p className='text-slate-500'>
                                    Waiting for opponent...
                                </p>
                            )}
                        </div>
                        {(opponent || playerInfo.playerOrder === 2) && (
                            <div className='size-3 rounded-full bg-green-400' />
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className='space-y-3'>
                    {canStart && (
                        <Button
                            onClick={handleStartGame}
                            className='h-14 w-full rounded-xl bg-linear-to-r from-cyan-500 to-blue-500 text-lg font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-[1.02] hover:from-cyan-400 hover:to-blue-400'>
                            <svg
                                className='mr-2 size-5'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                                strokeWidth={2}>
                                <path d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' />
                                <path d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                            Start Game
                        </Button>
                    )}

                    {!opponent && isHost && (
                        <p className='text-center text-sm text-slate-400'>
                            Share the room code with your friend!
                        </p>
                    )}

                    {opponent && !isHost && (
                        <p className='text-center text-sm text-slate-400'>
                            Waiting for the host to start the game...
                        </p>
                    )}

                    <Button
                        variant='ghost'
                        onClick={() => router.push('/lobby')}
                        className='w-full text-slate-400 hover:text-white'>
                        ← Back to Lobby
                    </Button>
                </div>
            </GlassPanel>

            <ConnectionIndicator isConnected={isConnected} />
        </div>
    )
}
