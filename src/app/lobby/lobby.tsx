'use client'

import { GlassPanel } from '@/components/glass-panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  LayoutGridIcon,
  LockIcon,
  TargetIcon,
  Users2Icon,
  UsersIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { createRoom, joinRoom, signOut } from './_lib/actions'

type GameModeCard = {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  disabled?: boolean
}

const GAME_MODES: GameModeCard[] = [
  {
    id: 'solo',
    name: 'Solo',
    description: 'Practice',
    icon: <UsersIcon className='size-8' />,
    color: 'text-cyan-400',
    disabled: true,
  },
  {
    id: 'battle',
    name: 'Battle',
    description: 'Ranked PvP',
    icon: <TargetIcon className='size-8' />,
    color: 'text-blue-400',
  },
  {
    id: 'coop',
    name: 'Co-op',
    description: 'Team Up',
    icon: <Users2Icon className='size-8' />,
    color: 'text-purple-400',
    disabled: true,
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Private Room',
    icon: <LockIcon className='size-8' />,
    color: 'text-pink-400',
    disabled: true,
  },
]

interface LobbyProps {
  nickname: string
}

export function Lobby({ nickname }: LobbyProps) {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedMode, setSelectedMode] = useState<string>('battle')
  const [isPendingSignOut, startSignOutTransition] = useTransition()

  const handleSignOut = () => {
    startSignOutTransition(async () => {
      await signOut()
    })
  }

  const handleCreateRoom = async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await createRoom(nickname)

      if (result.success && result.matchId) {
        router.push(`/game/${result.matchId}`)
      } else {
        setError(result.error || '방 생성에 실패했습니다')
        setIsLoading(false)
      }
    } catch {
      setError('오류가 발생했습니다')
      setIsLoading(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError('방 코드를 입력해주세요')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await joinRoom(roomCode.trim(), nickname)

      if (result.success && result.matchId) {
        router.push(`/game/${result.matchId}`)
      } else {
        setError(result.error || '방에 참가할 수 없습니다')
        setIsLoading(false)
      }
    } catch {
      setError('오류가 발생했습니다')
      setIsLoading(false)
    }
  }

  return (
    <div className='relative flex'>
      <main className='relative z-10 mx-auto flex w-full flex-1 flex-col gap-4'>
        {/* Header */}
        <div className='flex flex-wrap items-end justify-between gap-6'>
          <div className='flex flex-col gap-2'>
            <p className='text-base font-normal text-slate-400'>
              Select a mode and pop into action!
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/60 px-4 py-2'>
              <div className='flex size-8 items-center justify-center rounded-full bg-cyan-400/20'>
                <span className='text-sm font-bold text-cyan-400'>
                  {nickname.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className='text-sm font-medium text-white'>{nickname}</span>
            </div>
            <Button
              onClick={handleSignOut}
              disabled={isPendingSignOut}
              variant='ghost'
              className='rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-400 hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-400'
            >
              {isPendingSignOut ? 'Signing out...' : 'Sign Out'}
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className='grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-12'>
          {/* Left Column - Game Modes & Actions */}
          <div className='flex flex-col gap-6 lg:col-span-4'>
            {/* Game Modes */}
            <div>
              <h3 className='mb-4 flex items-center gap-2 text-lg font-bold text-white'>
                <LayoutGridIcon className='size-5 text-cyan-400' />
                Game Modes
              </h3>
              <div className='grid grid-cols-2 gap-3'>
                {GAME_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => !mode.disabled && setSelectedMode(mode.id)}
                    disabled={mode.disabled}
                    className={`group relative flex aspect-square flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border p-4 transition-all ${
                      mode.disabled
                        ? 'cursor-not-allowed border-white/5 bg-slate-900/30 opacity-50'
                        : selectedMode === mode.id
                          ? 'border-cyan-400/50 bg-cyan-400/10'
                          : 'border-white/10 bg-slate-900/60 hover:border-cyan-400/30 hover:bg-white/5'
                    }`}
                  >
                    {!mode.disabled && (
                      <div className='absolute inset-0 bg-linear-to-br from-cyan-500/0 to-cyan-500/10 opacity-0 transition-opacity group-hover:opacity-100' />
                    )}
                    <div
                      className={`flex size-14 items-center justify-center rounded-2xl bg-[#162032] shadow-lg transition-transform group-hover:scale-110 ${mode.color}`}
                    >
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
                  strokeWidth={2}
                >
                  <path d='M13 10V3L4 14h7v7l9-11h-7z' />
                </svg>
                Actions
              </h3>

              {/* Create Room Button */}
              <Button
                onClick={handleCreateRoom}
                disabled={isLoading}
                className='h-14 w-full rounded-xl bg-linear-to-r from-cyan-500 to-blue-500 text-lg font-bold tracking-wide text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-[1.02] hover:from-cyan-400 hover:to-blue-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-[0.98]'
              >
                {isLoading ? (
                  <div className='size-5 animate-spin rounded-full border-2 border-white border-t-transparent' />
                ) : (
                  <>
                    <svg
                      className='mr-2 size-5'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      strokeWidth={2}
                    >
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
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className='h-full flex-1 border-none bg-transparent text-white placeholder:text-slate-600 focus-visible:ring-0'
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={isLoading || roomCode.length !== 6}
                    className='border-l border-white/10 bg-slate-800 px-5 text-sm font-bold text-white transition-colors hover:bg-cyan-400 hover:text-slate-900 disabled:opacity-50'
                  >
                    JOIN
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <p className='text-center text-sm text-red-400'>{error}</p>
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
                    strokeWidth={2}
                  >
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
                    strokeWidth={1.5}
                  >
                    <path d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                  </svg>
                </div>
                <h4 className='mb-2 text-lg font-bold text-white'>
                  No Public Rooms Yet
                </h4>
                <p className='max-w-sm text-sm text-slate-400'>
                  Public room matchmaking is coming soon. For now, create a
                  private room and share the code with your friends!
                </p>
              </div>
            </GlassPanel>
          </div>
        </div>
      </main>
    </div>
  )
}
