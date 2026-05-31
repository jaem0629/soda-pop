'use client'

import { cn } from '@/lib/utils'
import {
  Gamepad2Icon,
  Loader2Icon,
  LockKeyholeIcon,
  PlayIcon,
  SwordsIcon,
} from 'lucide-react'
import { useState } from 'react'

type GameMode = 'solo' | 'battle'
type EntryType = 'private' | 'public'
type ModeAction = 'solo' | 'quick-battle' | 'private-battle' | 'join-code'

interface ModeSelectProps {
  onCreateMatch: (mode: GameMode, entryType: EntryType) => Promise<void>
  onJoinQuickBattle: () => Promise<void>
  onJoinMatch: (code: string) => Promise<void>
}

const MATCH_CODE_LENGTH = 6
const MODE_CARDS: {
  id: Exclude<ModeAction, 'join-code'>
  title: string
  eyebrow: string
  description: string
  actionLabel: string
  mode: GameMode
  entryType: EntryType
  icon: typeof Gamepad2Icon
  className: string
  iconClassName: string
}[] = [
  {
    id: 'solo',
    title: 'Solo Pop',
    eyebrow: 'One Player',
    description: '60-second score chase',
    actionLabel: 'Start Solo',
    mode: 'solo',
    entryType: 'private',
    icon: Gamepad2Icon,
    className: 'border-emerald-400/30 bg-emerald-400/10',
    iconClassName: 'bg-emerald-400 text-emerald-950',
  },
  {
    id: 'quick-battle',
    title: 'Quick Battle',
    eyebrow: 'Two Players',
    description: 'Find a public rival',
    actionLabel: 'Battle Now',
    mode: 'battle',
    entryType: 'public',
    icon: SwordsIcon,
    className: 'border-sky-400/30 bg-sky-400/10',
    iconClassName: 'bg-sky-400 text-sky-950',
  },
  {
    id: 'private-battle',
    title: 'Private Battle',
    eyebrow: 'Invite Code',
    description: 'Create a room for a friend',
    actionLabel: 'Create Code',
    mode: 'battle',
    entryType: 'private',
    icon: LockKeyholeIcon,
    className: 'border-amber-300/30 bg-amber-300/10',
    iconClassName: 'bg-amber-300 text-amber-950',
  },
]

export function ModeSelect({
  onCreateMatch,
  onJoinQuickBattle,
  onJoinMatch,
}: ModeSelectProps) {
  const [loadingAction, setLoadingAction] = useState<ModeAction | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleModeSelect = async (card: (typeof MODE_CARDS)[number]) => {
    setError(null)
    setLoadingAction(card.id)

    try {
      if (card.id === 'quick-battle') {
        await onJoinQuickBattle()
      } else {
        await onCreateMatch(card.mode, card.entryType)
      }
    } catch (modeError) {
      setError(
        modeError instanceof Error ? modeError.message : 'Unable to start',
      )
      setLoadingAction(null)
    }
  }

  const handleJoinCode = async () => {
    const matchCode = code.trim()
    if (matchCode.length !== MATCH_CODE_LENGTH) return

    setError(null)
    setLoadingAction('join-code')

    try {
      await onJoinMatch(matchCode)
    } catch (joinError) {
      setError(
        joinError instanceof Error ? joinError.message : 'Unable to join',
      )
      setLoadingAction(null)
    }
  }

  return (
    <section className='flex min-h-0 flex-1 flex-col gap-6'>
      <div className='grid gap-4 lg:grid-cols-3'>
        {MODE_CARDS.map((card) => {
          const Icon = card.icon
          const isLoading = loadingAction === card.id

          return (
            <button
              key={card.id}
              onClick={() => handleModeSelect(card)}
              disabled={loadingAction !== null}
              className={cn(
                'flex min-h-56 cursor-pointer flex-col justify-between rounded-lg border p-5 text-left shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:bg-white/10 disabled:cursor-default disabled:opacity-60',
                card.className,
              )}
            >
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <p className='text-xs font-black tracking-widest text-white/50 uppercase'>
                    {card.eyebrow}
                  </p>
                  <h2 className='mt-2 text-3xl font-black tracking-tight'>
                    {card.title}
                  </h2>
                  <p className='mt-2 text-sm font-medium text-white/60'>
                    {card.description}
                  </p>
                </div>
                <div
                  className={cn(
                    'flex size-12 shrink-0 items-center justify-center rounded-lg',
                    card.iconClassName,
                  )}
                >
                  {isLoading ? (
                    <Loader2Icon className='size-6 animate-spin' />
                  ) : (
                    <Icon className='size-6' />
                  )}
                </div>
              </div>

              <span className='mt-8 flex h-11 items-center justify-center gap-2 rounded-lg bg-white text-sm font-black text-slate-950'>
                <PlayIcon className='size-4' />
                {card.actionLabel}
              </span>
            </button>
          )
        })}
      </div>

      <div className='flex flex-col gap-4 rounded-lg border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-end'>
        <label className='flex min-w-0 flex-1 flex-col gap-2'>
          <span className='text-xs font-black tracking-widest text-white/40 uppercase'>
            Join Private Code
          </span>
          <input
            value={code}
            onChange={(event) => {
              setCode(event.target.value.toUpperCase())
              setError(null)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleJoinCode()
            }}
            maxLength={MATCH_CODE_LENGTH}
            className='h-12 min-w-0 rounded-lg bg-black/30 px-4 text-lg font-black tracking-widest ring-1 ring-white/10 transition outline-none placeholder:text-white/20 focus:ring-sky-300'
            placeholder='ABC123'
          />
        </label>
        <button
          onClick={handleJoinCode}
          disabled={
            code.trim().length !== MATCH_CODE_LENGTH || loadingAction !== null
          }
          className='flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-sky-400 px-6 text-sm font-black text-sky-950 transition hover:bg-sky-300 disabled:cursor-default disabled:opacity-50'
        >
          {loadingAction === 'join-code' ? (
            <Loader2Icon className='size-4 animate-spin' />
          ) : (
            <LockKeyholeIcon className='size-4' />
          )}
          Join
        </button>
      </div>

      {error && <p className='text-sm font-medium text-red-300'>{error}</p>}
    </section>
  )
}
