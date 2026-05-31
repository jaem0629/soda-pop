'use client'

import { cn } from '@/lib/utils'
import { TrophyIcon } from 'lucide-react'
import { useState } from 'react'
import type { LeaderboardEntry } from '../_lib/queries'

interface LeaderboardProps {
  soloEntries: LeaderboardEntry[]
  battleEntries: LeaderboardEntry[]
}

type Tab = 'solo' | 'battle'

export function Leaderboard({ soloEntries, battleEntries }: LeaderboardProps) {
  const [tab, setTab] = useState<Tab>('solo')
  const entries = tab === 'solo' ? soloEntries : battleEntries

  return (
    <div className='flex h-full flex-col rounded-lg border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 sm:p-5'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <TrophyIcon className='size-4 text-amber-400' />
          <p className='text-xs font-semibold tracking-widest text-white/40 uppercase'>
            Leaderboard
          </p>
        </div>

        <div className='flex gap-1 rounded-lg bg-white/5 p-1'>
          <button
            onClick={() => setTab('solo')}
            className={cn(
              'flex-1 cursor-pointer rounded-md px-3 py-2 text-xs font-bold transition-colors',
              tab === 'solo'
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/60',
            )}
          >
            Solo
          </button>
          <button
            onClick={() => setTab('battle')}
            className={cn(
              'flex-1 cursor-pointer rounded-md px-3 py-2 text-xs font-bold transition-colors',
              tab === 'battle'
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/60',
            )}
          >
            Battle
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className='flex flex-1 items-center justify-center'>
          <p className='text-sm text-white/30'>No scores yet</p>
        </div>
      ) : (
        <div className='flex flex-col gap-2'>
          {entries.map((entry, i) => (
            <div
              key={`${entry.user_ids.join('-')}-${entry.score}-${i}`}
              className='flex items-center gap-3 rounded-lg px-2 py-2'
            >
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  i === 0
                    ? 'bg-amber-400/20 text-amber-400'
                    : i === 1
                      ? 'bg-gray-300/20 text-gray-300'
                      : i === 2
                        ? 'bg-orange-400/20 text-orange-400'
                        : 'bg-white/5 text-white/30',
                )}
              >
                {i + 1}
              </span>
              <span className='min-w-0 flex-1 truncate text-sm'>
                {entry.player_names[0] ?? 'Unknown'}
              </span>
              <span className='text-sm font-bold text-white/60 tabular-nums'>
                {entry.score.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
