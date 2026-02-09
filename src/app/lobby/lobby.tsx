'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  LayoutGridIcon,
  Loader2Icon,
  LockIcon,
  SearchIcon,
  SwordsIcon,
  TargetIcon,
  Users2Icon,
  UsersIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createMatch, joinMatch } from './_lib/actions'

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
    description: 'Private Match',
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
  const [matchCode, setMatchCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreateMatch = async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await createMatch(nickname)

      if (result.success && result.matchId) {
        router.push(`/game/${result.matchId}`)
      } else {
        setError(result.error || 'Failed to create match')
        setIsLoading(false)
      }
    } catch {
      setError('An error occurred')
      setIsLoading(false)
    }
  }

  const handleJoinMatch = async () => {
    if (!matchCode.trim()) {
      setError('Please enter a match code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await joinMatch(matchCode.trim(), nickname)

      if (result.success && result.matchId) {
        router.push(`/game/${result.matchId}`)
      } else {
        setError(result.error || 'Failed to join match')
        setIsLoading(false)
      }
    } catch {
      setError('An error occurred')
      setIsLoading(false)
    }
  }

  return (
    <main className='flex w-full flex-1 gap-8'>
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
                placeholder='Enter Match Code...'
                value={matchCode}
                onChange={(e) => setMatchCode(e.target.value.toUpperCase())}
                maxLength={6}
                className='h-full flex-1 rounded-2xl rounded-r-none border-none bg-transparent focus-visible:ring-0'
              />
              <button
                onClick={handleJoinMatch}
                disabled={isLoading}
                className='bg-muted rounded-r-2xl px-4 text-sm font-bold disabled:opacity-50'
              >
                JOIN
              </button>
            </div>
          </div>
          <Separator />
          <Button
            onClick={handleCreateMatch}
            disabled={isLoading}
            size='lg'
            className='h-14 rounded-2xl text-lg font-bold'
          >
            {isLoading ? (
              <Loader2Icon className='animate-spin' />
            ) : (
              <>
                <SwordsIcon />
                CREATE MATCH
              </>
            )}
          </Button>

          {/* Error Message */}
          {error && (
            <p className='text-destructive text-center text-sm'>{error}</p>
          )}
        </div>
      </div>

      {/* Right Column - Open Matches */}
      <div className='flex flex-1 flex-col rounded-4xl border'>
        <div className='flex flex-wrap items-center justify-between gap-4 p-8'>
          <div className='flex items-center gap-4'>
            <LayoutGridIcon />
            <div>
              <h3 className='text-xl leading-none font-bold'>Open Matches</h3>
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
          <h4 className='mb-2 text-lg font-bold'>No Open Matches Yet</h4>
          <p className='text-muted-foreground max-w-sm text-sm'>
            Public matchmaking is coming soon. For now, create a private match
            and share the code with your friends!
          </p>
        </div>
      </div>
    </main>
  )
}
