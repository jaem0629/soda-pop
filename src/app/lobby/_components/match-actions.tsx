'use client'

import { cn } from '@/lib/utils'
import { useState } from 'react'
import { CreateRoomDialog } from './create-room-dialog'

interface MatchActionsProps {
  onCreateRoom: (mode: string) => Promise<void>
  onJoinMatch: (code: string) => Promise<void>
}

export function MatchActions({ onCreateRoom, onJoinMatch }: MatchActionsProps) {
  const [matchCode, setMatchCode] = useState('')
  const [error, setError] = useState(false)

  const handleJoin = async () => {
    if (!matchCode.trim()) return
    setError(false)
    try {
      await onJoinMatch(matchCode.trim())
    } catch {
      setError(true)
    }
  }

  return (
    <div className='flex items-center gap-3'>
      <div
        className={cn(
          'flex h-12 flex-1 items-center gap-2 rounded-2xl px-2 transition-colors',
          error ? 'bg-white/5 ring-1 ring-red-500/40' : 'bg-white/5',
        )}
      >
        <input
          type='text'
          placeholder='Match code'
          value={matchCode}
          onChange={(e) => {
            setMatchCode(e.target.value.toUpperCase())
            if (error) setError(false)
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          maxLength={6}
          className={cn(
            'ml-2 w-full bg-transparent text-sm font-bold tracking-widest outline-none placeholder:font-medium placeholder:tracking-normal placeholder:text-white/20',
            error && 'text-red-400',
          )}
        />
        <button
          onClick={handleJoin}
          disabled={!matchCode.trim()}
          className='shrink-0 cursor-pointer rounded-xl bg-white/10 px-4 py-1.5 text-sm font-semibold transition-colors hover:bg-white/20 disabled:cursor-default disabled:opacity-50'
        >
          Join
        </button>
      </div>

      <CreateRoomDialog onCreateRoom={onCreateRoom} />
    </div>
  )
}
