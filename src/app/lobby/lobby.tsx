'use client'

import { useRouter } from 'next/navigation'
import { createMatch, joinMatch } from './_lib/actions'
import type { WaitingRoom } from './_lib/queries'
import { MatchActions } from './_components/match-actions'
import { RoomList } from './_components/room-list'

interface LobbyProps {
  nickname: string
  rooms: WaitingRoom[]
}

export function Lobby({ nickname, rooms }: LobbyProps) {
  const router = useRouter()

  const handleCreateRoom = async (mode: string) => {
    const result = await createMatch(
      nickname,
      mode as 'solo' | 'battle' | 'coop' | 'custom',
    )

    if (result.success && result.matchId) {
      router.push(`/game/${result.matchId}`)
    } else {
      throw new Error(result.error || 'Failed to create room')
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

  return (
    <main className='flex flex-1 flex-col gap-6'>
      <MatchActions
        onCreateRoom={handleCreateRoom}
        onJoinMatch={handleJoinMatch}
      />
      <RoomList rooms={rooms} onJoinRoom={handleJoinMatch} />
    </main>
  )
}
