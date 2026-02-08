'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  LayoutGridIcon,
  Loader2Icon,
  LockIcon,
  PlusIcon,
  SearchIcon,
  TargetIcon,
  Users2Icon,
  UsersIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createRoom, joinRoom } from './_lib/actions'

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
    <main className='flex w-full gap-4'>
      <div className='flex flex-col gap-4'>
        <div className='grid grid-cols-2 gap-4'>
          {GAME_MODES.map((mode) => (
            <button
              key={mode.id}
              disabled={mode.disabled}
              className={cn(
                `flex aspect-square flex-col items-center justify-center gap-4 rounded-4xl border p-4 transition-all`,
                mode.disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <div
                className={cn(
                  `bg-muted flex items-center justify-center rounded-2xl p-4`,
                  mode.color,
                )}
              >
                {mode.icon}
              </div>
              <div className='flex flex-col gap-1 text-center'>
                <span className='text-lg font-semibold'>{mode.name}</span>
                <span className='text-muted-foreground text-xs'>
                  {mode.description}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className='flex flex-col gap-4 rounded-4xl p-4'>
          <div className='flex flex-col gap-4'>
            <label className='text-muted-foreground text-xs font-bold tracking-wider uppercase'>
              Join via Code
            </label>
            <div className='flex h-12'>
              <Input
                type='text'
                placeholder='Enter Room Code...'
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className='h-full flex-1 rounded-2xl rounded-r-none border-none bg-transparent focus-visible:ring-0'
              />
              <button
                onClick={handleJoinRoom}
                disabled={isLoading}
                className='bg-muted rounded-r-2xl px-4 text-sm font-bold disabled:opacity-50'
              >
                JOIN
              </button>
            </div>
          </div>
          <Separator />
          <Button
            onClick={handleCreateRoom}
            disabled={isLoading}
            size='lg'
            className='h-14 rounded-2xl text-lg font-bold'
          >
            {isLoading ? (
              <Loader2Icon className='animate-spin' />
            ) : (
              <>
                <PlusIcon />
                CREATE ROOM
              </>
            )}
          </Button>

          {/* Error Message */}
          {error && <p className='text-center text-sm text-red-400'>{error}</p>}
        </div>
      </div>

      {/* Right Column - Public Rooms */}
      <div className='flex flex-1 flex-col rounded-4xl border'>
        <div className='flex flex-wrap items-center justify-between gap-4 p-8'>
          <div className='flex items-center gap-4'>
            <LayoutGridIcon />
            <div>
              <h3 className='text-xl leading-none font-bold'>Public Rooms</h3>
              <p className='mt-1 text-xs'>
                <span className='text-muted-foreground font-bold'>
                  Coming Soon
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className='flex flex-1 flex-col items-center justify-center p-8 text-center'>
          <div className='bg-muted mb-4 flex items-center justify-center rounded-full p-4'>
            <SearchIcon />
          </div>
          <h4 className='mb-2 text-lg font-bold'>No Public Rooms Yet</h4>
          <p className='text-muted-foreground max-w-sm text-sm'>
            Public room matchmaking is coming soon. For now, create a private
            room and share the code with your friends!
          </p>
        </div>
      </div>
    </main>
  )
}
