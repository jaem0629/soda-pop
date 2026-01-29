'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { GlassPanel } from '@/components/glass-panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createMatch, joinMatch } from '@/lib/match'

type GameModeCard = {
    id: string
    name: string
    description: string
    icon: React.ReactNode
    color: string
    disabled?: boolean
}

const gameModes: GameModeCard[] = [
    {
        id: 'solo',
        name: 'Solo',
        description: 'Practice',
        icon: (
            <svg
                className='size-8'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2}>
                <path d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
            </svg>
        ),
        color: 'text-cyan-400',
        disabled: true,
    },
    {
        id: 'battle',
        name: 'Battle',
        description: 'Ranked PvP',
        icon: (
            <svg
                className='size-8'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2}>
                <path d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' />
            </svg>
        ),
        color: 'text-blue-400',
    },
    {
        id: 'coop',
        name: 'Co-op',
        description: 'Team Up',
        icon: (
            <svg
                className='size-8'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2}>
                <path d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
            </svg>
        ),
        color: 'text-purple-400',
        disabled: true,
    },
    {
        id: 'custom',
        name: 'Custom',
        description: 'Private Room',
        icon: (
            <svg
                className='size-8'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2}>
                <path d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' />
                <path d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
            </svg>
        ),
        color: 'text-pink-400',
        disabled: true,
    },
]

export default function LobbyPage() {
    const router = useRouter()
    const [nickname, setNickname] = useState('')
    const [roomCode, setRoomCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [selectedMode, setSelectedMode] = useState<string>('battle')

    const handleCreateRoom = async () => {
        if (!nickname.trim()) {
            setError('닉네임을 입력해주세요')
            return
        }

        setIsLoading(true)
        setError('')

        const result = await createMatch(nickname.trim(), 'battle', 'private')

        if (result) {
            localStorage.setItem(
                'player',
                JSON.stringify({
                    matchId: result.match.id,
                    playerId: result.player.id,
                    playerOrder: result.player.player_order,
                    nickname: nickname.trim(),
                })
            )
            router.push(`/game/${result.match.id}/waiting`)
        } else {
            setError('방 생성에 실패했습니다')
            setIsLoading(false)
        }
    }

    const handleJoinRoom = async () => {
        if (!nickname.trim()) {
            setError('닉네임을 입력해주세요')
            return
        }
        if (!roomCode.trim()) {
            setError('방 코드를 입력해주세요')
            return
        }

        setIsLoading(true)
        setError('')

        const result = await joinMatch(roomCode.trim(), nickname.trim())

        if (result) {
            localStorage.setItem(
                'player',
                JSON.stringify({
                    matchId: result.match.id,
                    playerId: result.player.id,
                    playerOrder: result.playerOrder,
                    nickname: nickname.trim(),
                })
            )
            router.push(`/game/${result.match.id}/waiting`)
        } else {
            setError('방에 참가할 수 없습니다. 코드를 확인해주세요.')
            setIsLoading(false)
        }
    }

    return (
        <div className='relative flex min-h-svh flex-col overflow-hidden bg-[#0B1120] text-white'>
            <Header />

            <main className='relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6 p-6 md:px-10 md:py-8'>
                {/* Header */}
                <div className='flex flex-wrap items-end justify-between gap-6'>
                    <div className='flex flex-col gap-2'>
                        <h1 className='bg-linear-to-r from-cyan-300 to-blue-500 bg-clip-text text-4xl leading-tight font-black tracking-[-0.033em] text-transparent md:text-5xl'>
                            Game Lobby
                        </h1>
                        <p className='text-base font-normal text-slate-400'>
                            Select a mode and pop into action!
                        </p>
                    </div>
                </div>

                {/* Main Grid */}
                <div className='grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-12'>
                    {/* Left Column - Game Modes & Actions */}
                    <div className='flex flex-col gap-6 lg:col-span-4'>
                        {/* Game Modes */}
                        <div>
                            <h3 className='mb-4 flex items-center gap-2 text-lg font-bold text-white'>
                                <svg
                                    className='size-5 text-cyan-400'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                    strokeWidth={2}>
                                    <path d='M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' />
                                </svg>
                                Game Modes
                            </h3>
                            <div className='grid grid-cols-2 gap-3'>
                                {gameModes.map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={() =>
                                            !mode.disabled &&
                                            setSelectedMode(mode.id)
                                        }
                                        disabled={mode.disabled}
                                        className={`group relative flex aspect-square flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border p-4 transition-all ${
                                            mode.disabled
                                                ? 'cursor-not-allowed border-white/5 bg-slate-900/30 opacity-50'
                                                : selectedMode === mode.id
                                                  ? 'border-cyan-400/50 bg-cyan-400/10'
                                                  : 'border-white/10 bg-slate-900/60 hover:border-cyan-400/30 hover:bg-white/5'
                                        }`}>
                                        {!mode.disabled && (
                                            <div className='absolute inset-0 bg-linear-to-br from-cyan-500/0 to-cyan-500/10 opacity-0 transition-opacity group-hover:opacity-100' />
                                        )}
                                        <div
                                            className={`flex size-14 items-center justify-center rounded-2xl bg-[#162032] shadow-lg transition-transform group-hover:scale-110 ${mode.color}`}>
                                            {mode.icon}
                                        </div>
                                        <div className='text-center'>
                                            <span className='block text-lg font-bold text-white'>
                                                {mode.name}
                                            </span>
                                            <span className='block text-xs text-slate-400'>
                                                {mode.description}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <GlassPanel className='flex flex-col gap-5 rounded-[2rem] border border-white/5 p-6'>
                            <h3 className='flex items-center gap-2 text-lg font-bold text-white'>
                                <svg
                                    className='size-5 text-cyan-400'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                    strokeWidth={2}>
                                    <path d='M13 10V3L4 14h7v7l9-11h-7z' />
                                </svg>
                                Actions
                            </h3>

                            {/* Nickname Input */}
                            <div className='flex flex-col gap-2'>
                                <label className='ml-1 text-xs font-bold tracking-wider text-slate-400 uppercase'>
                                    Nickname
                                </label>
                                <Input
                                    type='text'
                                    placeholder='Enter your nickname...'
                                    value={nickname}
                                    onChange={(e) =>
                                        setNickname(e.target.value)
                                    }
                                    maxLength={12}
                                    className='h-12 rounded-xl border-white/10 bg-[#162032] text-white placeholder:text-slate-600 focus:border-cyan-400'
                                />
                            </div>

                            {/* Create Room Button */}
                            <Button
                                onClick={handleCreateRoom}
                                disabled={isLoading || !nickname.trim()}
                                className='h-14 w-full rounded-xl bg-linear-to-r from-cyan-500 to-blue-500 text-lg font-bold tracking-wide text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-[1.02] hover:from-cyan-400 hover:to-blue-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-[0.98]'>
                                {isLoading ? (
                                    <div className='size-5 animate-spin rounded-full border-2 border-white border-t-transparent' />
                                ) : (
                                    <>
                                        <svg
                                            className='mr-2 size-5'
                                            fill='none'
                                            viewBox='0 0 24 24'
                                            stroke='currentColor'
                                            strokeWidth={2}>
                                            <path d='M12 4v16m8-8H4' />
                                        </svg>
                                        CREATE ROOM
                                    </>
                                )}
                            </Button>

                            <div className='h-px w-full bg-white/10' />

                            {/* Join via Code */}
                            <div className='flex flex-col gap-2'>
                                <label className='ml-1 text-xs font-bold tracking-wider text-slate-400 uppercase'>
                                    Join via Code
                                </label>
                                <div className='flex h-12 overflow-hidden rounded-xl border border-white/10 bg-[#162032] focus-within:border-cyan-400'>
                                    <Input
                                        type='text'
                                        placeholder='Enter Room Code...'
                                        value={roomCode}
                                        onChange={(e) =>
                                            setRoomCode(
                                                e.target.value.toUpperCase()
                                            )
                                        }
                                        maxLength={6}
                                        className='h-full flex-1 border-none bg-transparent text-white placeholder:text-slate-600 focus-visible:ring-0'
                                    />
                                    <button
                                        onClick={handleJoinRoom}
                                        disabled={
                                            isLoading ||
                                            roomCode.length !== 6 ||
                                            !nickname.trim()
                                        }
                                        className='border-l border-white/10 bg-slate-800 px-5 text-sm font-bold text-white transition-colors hover:bg-cyan-400 hover:text-slate-900 disabled:opacity-50'>
                                        JOIN
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <p className='text-center text-sm text-red-400'>
                                    {error}
                                </p>
                            )}
                        </GlassPanel>
                    </div>

                    {/* Right Column - Public Rooms */}
                    <div className='flex min-h-[500px] flex-col lg:col-span-8'>
                        <GlassPanel className='flex flex-1 flex-col overflow-hidden rounded-[2.5rem] border border-white/10 p-1 shadow-2xl shadow-black/20'>
                            <div className='flex flex-wrap items-center justify-between gap-4 p-6 pb-4'>
                                <div className='flex items-center gap-3'>
                                    <svg
                                        className='size-8 text-cyan-400'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                        stroke='currentColor'
                                        strokeWidth={2}>
                                        <path d='M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01' />
                                    </svg>
                                    <div>
                                        <h3 className='text-xl leading-none font-bold text-white'>
                                            Public Rooms
                                        </h3>
                                        <p className='mt-1 text-xs text-slate-400'>
                                            <span className='font-bold text-green-400'>
                                                Coming Soon
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Filter Tabs */}
                                <div className='flex rounded-full border border-white/5 bg-[#162032] p-1'>
                                    <button className='rounded-full bg-cyan-400 px-5 py-2 text-sm font-bold text-slate-900 shadow-sm'>
                                        All
                                    </button>
                                    <button className='px-5 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white'>
                                        Classic
                                    </button>
                                    <button className='px-5 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white'>
                                        Blitz
                                    </button>
                                    <button className='px-5 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white'>
                                        Ranked
                                    </button>
                                </div>
                            </div>

                            {/* Empty State */}
                            <div className='flex flex-1 flex-col items-center justify-center p-8 text-center'>
                                <div className='mb-4 flex size-20 items-center justify-center rounded-full bg-slate-800/50'>
                                    <svg
                                        className='size-10 text-slate-600'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                        stroke='currentColor'
                                        strokeWidth={1.5}>
                                        <path d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                                    </svg>
                                </div>
                                <h4 className='mb-2 text-lg font-bold text-white'>
                                    No Public Rooms Yet
                                </h4>
                                <p className='max-w-sm text-sm text-slate-400'>
                                    Public room matchmaking is coming soon. For
                                    now, create a private room and share the
                                    code with your friends!
                                </p>
                            </div>
                        </GlassPanel>
                    </div>
                </div>
            </main>
        </div>
    )
}
