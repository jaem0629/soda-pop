'use client'

import { useRouter } from 'next/navigation'
import { createMatch, joinMatch, joinMatchById } from './_lib/actions'
import type { LeaderboardEntry, WaitingMatch } from './_lib/queries'
import { Leaderboard } from './_components/leaderboard'
import { MatchList } from './_components/match-list'

interface LobbyProps {
  nickname: string
  matches: WaitingMatch[]
  soloLeaderboard: LeaderboardEntry[]
  battleLeaderboard: LeaderboardEntry[]
}

export function Lobby({
  nickname,
  matches,
  soloLeaderboard,
  battleLeaderboard,
}: LobbyProps) {
  const router = useRouter()

  const handleCreateMatch = async (mode: string, entryType: string) => {
    const result = await createMatch(
      nickname,
      mode as 'solo' | 'battle',
      entryType as 'private' | 'public',
    )

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

  const handleJoinMatchById = async (matchId: string) => {
    const result = await joinMatchById(matchId, nickname)

    if (result.success && result.matchId) {
      router.push(`/game/${result.matchId}`)
    } else {
      throw new Error(result.error || 'Failed to join match')
    }
  }

  return (
    <main className='flex flex-1 gap-6'>
      <div className='flex min-w-0 flex-1 flex-col'>
        <MatchList
          matches={matches}
          onJoinMatch={handleJoinMatch}
          onJoinMatchById={handleJoinMatchById}
          onCreateMatch={handleCreateMatch}
        />
      </div>

      <div className='hidden w-80 shrink-0 lg:block'>
        <Leaderboard
          soloEntries={soloLeaderboard}
          battleEntries={battleLeaderboard}
        />
      </div>
    </main>
  )
}
