'use client'

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

export function ModeSelect({
  onCreateMatch,
  onJoinQuickBattle,
  onJoinMatch,
}: ModeSelectProps) {
  const [loadingAction, setLoadingAction] = useState<ModeAction | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleModeSelect = async (
    id: Exclude<ModeAction, 'join-code'>,
    mode: GameMode,
    entryType: EntryType,
  ) => {
    setError(null)
    setLoadingAction(id)

    try {
      if (id === 'quick-battle') {
        await onJoinQuickBattle()
      } else {
        await onCreateMatch(mode, entryType)
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
    <section className='grid gap-4 sm:grid-cols-2'>
      <button
        onClick={() => handleModeSelect('solo', 'solo', 'private')}
        disabled={loadingAction !== null}
        className='group flex min-h-80 cursor-pointer flex-col justify-between rounded-3xl border border-emerald-300/15 bg-black/20 p-5 text-left transition hover:-translate-y-1 hover:border-emerald-300/35 hover:bg-black/10 disabled:cursor-default disabled:opacity-60'
      >
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            <p className='text-xs font-semibold tracking-widest text-white/35 uppercase'>
              One Player
            </p>
            <h2 className='mt-4 max-w-sm text-5xl leading-none font-black tracking-tight text-white'>
              Solo Pop
            </h2>
            <p className='mt-4 max-w-sm text-base leading-7 font-medium text-white/45'>
              Chase your best score in a 60-second run.
            </p>
          </div>
          <div className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-300/12 text-emerald-200 transition group-hover:scale-105 group-hover:bg-emerald-300/18'>
            {loadingAction === 'solo' ? (
              <Loader2Icon className='size-6 animate-spin' />
            ) : (
              <Gamepad2Icon className='size-6' />
            )}
          </div>
        </div>

        <span className='flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-300 text-sm font-black text-slate-950 transition group-hover:bg-emerald-200'>
          <PlayIcon className='size-4' />
          Start Solo
        </span>
      </button>

      <div className='flex min-h-80 flex-col gap-3 rounded-3xl border border-red-300/15 bg-black/20 p-5'>
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            <p className='text-xs font-semibold tracking-widest text-white/35 uppercase'>
              Two Players
            </p>
            <h2 className='mt-4 text-5xl leading-none font-black tracking-tight text-white'>
              Battle
            </h2>
            <p className='mt-4 max-w-sm text-base leading-7 font-medium text-white/45'>
              Match with a rival or invite a friend.
            </p>
          </div>
          <div className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-300/12 text-red-200'>
            <SwordsIcon className='size-6' />
          </div>
        </div>

        <button
          onClick={() => handleModeSelect('quick-battle', 'battle', 'public')}
          disabled={loadingAction !== null}
          className='mt-auto flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-400 text-sm font-black text-white transition hover:bg-red-300 disabled:cursor-default disabled:opacity-60'
        >
          {loadingAction === 'quick-battle' ? (
            <Loader2Icon className='size-4 animate-spin' />
          ) : (
            <PlayIcon className='size-4' />
          )}
          Quick Match
        </button>

        <button
          onClick={() =>
            handleModeSelect('private-battle', 'battle', 'private')
          }
          disabled={loadingAction !== null}
          className='flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/8 text-sm font-black text-white transition hover:bg-white/12 disabled:cursor-default disabled:opacity-60'
        >
          {loadingAction === 'private-battle' ? (
            <Loader2Icon className='size-4 animate-spin' />
          ) : (
            <PlayIcon className='size-4' />
          )}
          Create Private
        </button>

        <div className='rounded-2xl border border-white/10 bg-black/20 p-3'>
          <label className='flex min-w-0 flex-1 flex-col gap-2'>
            <span className='text-xs font-semibold tracking-widest text-white/35 uppercase'>
              Join Code
            </span>
            <div className='flex gap-2'>
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
                className='h-11 min-w-0 flex-1 rounded-2xl bg-black/30 px-4 text-base font-black tracking-widest text-white ring-1 ring-white/10 transition outline-none placeholder:text-white/20 focus:ring-white/40'
                placeholder='ABC123'
              />
              <button
                onClick={handleJoinCode}
                disabled={
                  code.trim().length !== MATCH_CODE_LENGTH ||
                  loadingAction !== null
                }
                className='flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-slate-950 transition hover:bg-zinc-200 disabled:cursor-default disabled:opacity-50'
              >
                {loadingAction === 'join-code' ? (
                  <Loader2Icon className='size-4 animate-spin' />
                ) : (
                  <LockKeyholeIcon className='size-4' />
                )}
                Join
              </button>
            </div>
          </label>
        </div>
      </div>

      {error && <p className='text-sm font-medium text-red-300'>{error}</p>}
    </section>
  )
}
