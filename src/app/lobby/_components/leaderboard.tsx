'use client'

import { cn } from '@/lib/utils'
import { TrophyIcon } from 'lucide-react'
import { useState } from 'react'
import type { LeaderboardEntry } from '../_lib/queries'

interface LeaderboardProps {
  nickname: string
  soloEntries: LeaderboardEntry[]
  battleEntries: LeaderboardEntry[]
  className?: string
  isCompact?: boolean
}

type Tab = 'solo' | 'battle'

export function Leaderboard({
  nickname,
  soloEntries,
  battleEntries,
  className,
  isCompact = false,
}: LeaderboardProps) {
  const [tab, setTab] = useState<Tab>('solo')
  const entries = tab === 'solo' ? soloEntries : battleEntries
  const bestScore = Math.max(0, ...soloEntries.map((entry) => entry.score))

  return (
    <aside
      className={cn(
        'flex h-full min-h-0 w-full min-w-0 flex-col rounded-3xl border border-white/10 bg-white/5 p-4',
        className,
      )}
    >
      <div className='shrink-0'>
        {!isCompact && (
          <div className='flex items-center gap-3'>
            <div className='flex size-11 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-200'>
              <TrophyIcon className='size-4' />
            </div>
            <div>
              <p className='text-xs font-semibold tracking-widest text-white/35 uppercase'>
                Score
              </p>
              <p className='text-base font-black text-white'>Leaderboard</p>
            </div>
          </div>
        )}

        <div
          className={cn(
            'rounded-3xl border border-white/10 bg-black/20 p-4',
            !isCompact && 'mt-4',
          )}
        >
          <p className='text-xs font-semibold tracking-widest text-white/35 uppercase'>
            Your best
          </p>
          <p className='mt-2 text-4xl font-black text-white'>
            {bestScore.toLocaleString()}
          </p>
          <p className='mt-2 truncate text-sm font-medium text-white/40'>
            {nickname}
          </p>
        </div>

        <div className='mt-4 flex gap-1 rounded-2xl bg-black/20 p-1'>
          <button
            onClick={() => setTab('solo')}
            className={cn(
              'flex-1 cursor-pointer rounded-full px-3 py-2 text-xs font-black transition-colors',
              tab === 'solo'
                ? 'bg-amber-300 text-slate-950'
                : 'text-white/40 hover:text-white/70',
            )}
          >
            Solo
          </button>
          <button
            onClick={() => setTab('battle')}
            className={cn(
              'flex-1 cursor-pointer rounded-full px-3 py-2 text-xs font-black transition-colors',
              tab === 'battle'
                ? 'bg-amber-300 text-slate-950'
                : 'text-white/40 hover:text-white/70',
            )}
          >
            Battle
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className='mt-4 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/15'>
          <p className='text-sm font-bold text-white/35'>No scores yet</p>
        </div>
      ) : (
        <div className='mt-4 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1'>
          {entries.map((entry, i) => (
            <div
              key={`${entry.user_ids.join('-')}-${entry.score}-${i}`}
              className='flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-3'
            >
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-black',
                  i === 0
                    ? 'bg-amber-300 text-slate-950'
                    : i === 1
                      ? 'bg-white/20 text-white'
                      : i === 2
                        ? 'bg-white/15 text-white/70'
                        : 'bg-white/10 text-white/35',
                )}
              >
                {i + 1}
              </span>
              <span className='min-w-0 flex-1 truncate text-sm font-bold text-white/70'>
                {entry.player_names[0] ?? 'Unknown'}
              </span>
              <span className='text-sm font-black text-white tabular-nums'>
                {entry.score.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}
