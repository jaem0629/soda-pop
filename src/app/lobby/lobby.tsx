'use client'

import { useRouter } from 'next/navigation'
import { createMatch, joinMatch, joinQuickBattle } from './_lib/actions'
import type { LeaderboardEntry } from './_lib/queries'
import { LeaderboardDialog } from './_components/leaderboard-dialog'
import { ModeSelect } from './_components/mode-select'

interface LobbyProps {
  nickname: string
  soloLeaderboard: LeaderboardEntry[]
  battleLeaderboard: LeaderboardEntry[]
  defaultLeaderboardOpen?: boolean
}

export function Lobby({
  nickname,
  soloLeaderboard,
  battleLeaderboard,
  defaultLeaderboardOpen = false,
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
    <main className='bg-background flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 sm:p-5'>
        <div className='mb-4 flex items-center justify-between gap-4'>
          <div className='min-w-0'>
            <p className='text-xs font-semibold tracking-widest text-white/35 uppercase'>
              Lobby
            </p>
            <h1 className='mt-1 truncate text-2xl font-black tracking-tight text-white sm:text-3xl'>
              Choose a mode
            </h1>
          </div>
          <LeaderboardDialog
            nickname={nickname}
            soloEntries={soloLeaderboard}
            battleEntries={battleLeaderboard}
            defaultOpen={defaultLeaderboardOpen}
          />
        </div>

        <ModeSelect
          onJoinMatch={handleJoinMatch}
          onJoinQuickBattle={handleJoinQuickBattle}
          onCreateMatch={handleCreateMatch}
        />
      </div>
    </main>
  )
}
