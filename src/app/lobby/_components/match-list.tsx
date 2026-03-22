'use client'

import { cn } from '@/lib/utils'
import { DoorOpenIcon, GlobeIcon, Loader2Icon, LockIcon } from 'lucide-react'
import { useState } from 'react'
import type { WaitingMatch } from '../_lib/queries'
import { CreateMatchDialog } from './create-match-dialog'

interface MatchListProps {
  matches: WaitingMatch[]
  onJoinMatch: (code: string) => Promise<void>
  onJoinMatchById: (matchId: string) => Promise<void>
  onCreateMatch: (mode: string, entryType: string) => Promise<void>
}

export function MatchList({
  matches,
  onJoinMatch,
  onJoinMatchById,
  onCreateMatch,
}: MatchListProps) {
  return (
    <div className='flex flex-1 flex-col rounded-2xl bg-white/5 p-4'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <DoorOpenIcon className='size-4 text-blue-400' />
          <p className='text-xs font-semibold tracking-widest text-white/40 uppercase'>
            Matches
          </p>
        </div>

        <CreateMatchDialog onCreateMatch={onCreateMatch} />
      </div>

      <div className='flex min-h-0 flex-1 flex-col divide-y divide-white/10 overflow-y-auto'>
        {matches.length === 0 ? (
          <div className='flex flex-1 items-center justify-center'>
            <p className='text-sm text-white/30'>
              No matches available — create one!
            </p>
          </div>
        ) : (
          matches.map((match) => (
            <MatchItem
              key={match.id}
              match={match}
              onJoinByCode={onJoinMatch}
              onJoinById={onJoinMatchById}
            />
          ))
        )}
      </div>
    </div>
  )
}

function MatchItem({
  match,
  onJoinByCode,
  onJoinById,
}: {
  match: WaitingMatch
  onJoinByCode: (code: string) => Promise<void>
  onJoinById: (matchId: string) => Promise<void>
}) {
  const [isJoining, setIsJoining] = useState(false)
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)

  const isPrivate = match.entry_type === 'private'

  const handleJoinPublic = async () => {
    setIsJoining(true)
    try {
      await onJoinById(match.id)
    } catch {
      setIsJoining(false)
    }
  }

  const handleJoinPrivate = async () => {
    if (!code.trim()) return
    setError(false)
    setIsJoining(true)
    try {
      await onJoinByCode(code.trim())
    } catch {
      setError(true)
      setIsJoining(false)
    }
  }

  return (
    <div className='flex flex-col gap-3 p-4'>
      <div className='flex items-center gap-4'>
        <div
          className={cn(
            'flex size-10 items-center justify-center rounded-xl',
            isPrivate
              ? 'bg-amber-400/10 text-amber-400'
              : 'bg-blue-400/10 text-blue-400',
          )}
        >
          {isPrivate ? (
            <LockIcon className='size-5' />
          ) : (
            <GlobeIcon className='size-5' />
          )}
        </div>

        <div className='min-w-0 flex-1'>
          <p className='truncate font-semibold'>{match.host_name}</p>
          <p className='text-xs text-white/40'>
            Battle · {isPrivate ? 'Private' : 'Public'}
          </p>
        </div>

        <span className='text-sm text-white/40'>
          {match.player_count}/{match.max_players}
        </span>

        {isPrivate ? (
          <button
            onClick={() => setShowCodeInput(!showCodeInput)}
            disabled={isJoining}
            className='cursor-pointer rounded-xl bg-white/10 px-4 py-2 text-sm font-bold transition-colors hover:bg-white/20 disabled:opacity-50'
          >
            {isJoining ? (
              <Loader2Icon className='size-4 animate-spin' />
            ) : (
              'Enter Code'
            )}
          </button>
        ) : (
          <button
            onClick={handleJoinPublic}
            disabled={isJoining}
            className='cursor-pointer rounded-xl bg-white/10 px-4 py-2 text-sm font-bold transition-colors hover:bg-white/20 disabled:opacity-50'
          >
            {isJoining ? (
              <Loader2Icon className='size-4 animate-spin' />
            ) : (
              'Join'
            )}
          </button>
        )}
      </div>

      {showCodeInput && isPrivate && (
        <div className='flex items-center gap-2'>
          <input
            type='text'
            placeholder='Enter match code'
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              if (error) setError(false)
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleJoinPrivate()}
            maxLength={6}
            className={cn(
              'h-10 flex-1 rounded-xl bg-white/5 px-4 text-sm font-bold tracking-widest outline-none placeholder:font-medium placeholder:tracking-normal placeholder:text-white/20',
              error && 'ring-1 ring-red-500/40',
            )}
          />
          <button
            onClick={handleJoinPrivate}
            disabled={!code.trim() || isJoining}
            className='cursor-pointer rounded-xl bg-blue-500/20 px-4 py-2 text-sm font-bold text-blue-400 transition-colors hover:bg-blue-500/30 disabled:cursor-default disabled:opacity-50'
          >
            Join
          </button>
        </div>
      )}
    </div>
  )
}
