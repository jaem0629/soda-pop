'use client'

import { useRouter } from 'next/navigation'
import { createMatch, joinMatch, joinQuickBattle } from './_lib/actions'
import type { LeaderboardEntry } from './_lib/queries'
import { Leaderboard } from './_components/leaderboard'
import { ModeSelect } from './_components/mode-select'

interface LobbyProps {
  nickname: string
  soloLeaderboard: LeaderboardEntry[]
  battleLeaderboard: LeaderboardEntry[]
}

export function Lobby({
  nickname,
  soloLeaderboard,
  battleLeaderboard,
}: LobbyProps) {
  const router = useRouter()

  const handleCreateMatch = async (
    mode: 'solo' | 'battle',
    entryType: 'private' | 'public',
  ) => {
    const result = await createMatch(nickname, mode, entryType)

    if (result.success && result.matchId) {
      router.push(`/game/${result.matchId}`)
    } else {
      throw new Error(result.error || 'Failed to create match')
    }
  }

  const handleJoinMatch = async (code: string) => {
    const result = await joinMatch(code, nickname)

    if (result.success && result.matchId) {
      router.push(`/game/${result.matchId}`)
    } else {
      throw new Error(result.error || 'Failed to join match')
    }
  }

  const handleJoinQuickBattle = async () => {
    const result = await joinQuickBattle(nickname)

    if (result.success && result.matchId) {
      router.push(`/game/${result.matchId}`)
    } else {
      throw new Error(result.error || 'Failed to join match')
    }
  }

  return (
    <main className='flex flex-1 flex-col gap-6 lg:grid lg:grid-cols-3'>
      <div className='flex min-w-0 flex-col gap-6 lg:col-span-2'>
        <section className='rounded-lg border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20'>
          <p className='text-xs font-black tracking-widest text-white/40 uppercase'>
            Lobby
          </p>
          <div className='mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <h1 className='text-4xl font-black tracking-tight sm:text-5xl'>
                Ready, {nickname}
              </h1>
              <p className='mt-2 max-w-2xl text-sm font-medium text-white/60 sm:text-base'>
                Pick a mode and pop chains before the timer runs out.
              </p>
            </div>
          </div>
        </section>

        <ModeSelect
          onJoinMatch={handleJoinMatch}
          onJoinQuickBattle={handleJoinQuickBattle}
          onCreateMatch={handleCreateMatch}
        />
      </div>

      <div className='min-h-96 lg:min-h-0'>
        <Leaderboard
          soloEntries={soloLeaderboard}
          battleEntries={battleLeaderboard}
        />
      </div>
    </main>
  )
}
