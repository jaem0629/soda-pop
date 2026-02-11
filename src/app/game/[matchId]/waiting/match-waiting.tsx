'use client'

import { Button } from '@/components/ui/button'
import {
  RealtimeProvider,
  useRealtimeContext,
  type GameEvent,
} from '@/contexts/realtime-context'
import { useRealtimeDB } from '@/hooks/use-realtime-db'
import { cn } from '@/lib/utils'
import {
  CheckIcon,
  CopyIcon,
  CrownIcon,
  PlayIcon,
  UserIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ConnectionIndicator from '../_components/connection-indicator'
import { leaveMatch, leaveMatchAsPlayer, startMatch } from '../_lib/actions'
import { getMatchClient } from '../_lib/client-queries'
import type { MatchPlayer, MatchWithPlayers } from '../_lib/types'

interface MatchWaitingProps {
  matchId: string
  userId: string
  initialMatch: MatchWithPlayers
  initialPlayer: MatchPlayer
}

export default function MatchWaiting(props: MatchWaitingProps) {
  return (
    <RealtimeProvider
      matchId={props.matchId}
      playerNumber={props.initialPlayer.player_order}
    >
      <MatchWaitingContent {...props} />
    </RealtimeProvider>
  )
}

function MatchWaitingContent({
  matchId,
  userId,
  initialMatch,
  initialPlayer,
}: MatchWaitingProps) {
  const router = useRouter()
  const { isConnected, sendGameStart, sendPlayerJoined, subscribe } =
    useRealtimeContext()

  const [match, setMatch] = useState(initialMatch)
  const myPlayer =
    match.players.find((p) => p.user_id === userId) ?? initialPlayer
  const opponent = match.players.find((p) => p.user_id !== userId)

  const isHost = myPlayer.is_host
  const canStart = isHost && match.players.length >= match.max_players

  const reloadMatch = async () => {
    const data = await getMatchClient(matchId)
    if (data) {
      setMatch(data)
    }
  }

  // Listen for DB changes (player join/leave)
  useRealtimeDB({
    table: 'match_players',
    filter: `match_id=eq.${matchId}`,
    onUpdate: reloadMatch,
  })

  // Handle game events (DB changes are handled by useRealtimeDB)
  useEffect(() => {
    const unsubscribe = subscribe((event: GameEvent) => {
      switch (event.type) {
        case 'game_start':
          router.push(`/game/${matchId}/playing`)
          break
      }
    })

    return unsubscribe
  }, [subscribe, matchId, router])

  // Send player joined event when connected (for non-host)
  useEffect(() => {
    if (isConnected && !isHost) {
      sendPlayerJoined(myPlayer.player_name)
    }
  }, [isConnected, isHost, sendPlayerJoined, myPlayer.player_name])

  // Start game handler
  const handleStartGame = async () => {
    if (!canStart) return

    const updatedMatch = await startMatch(matchId)
    if (updatedMatch) {
      sendGameStart()
      router.push(`/game/${matchId}/playing`)
    }
  }

  // Leave match handler
  const handleLeaveMatch = async () => {
    if (isHost) {
      // Host leaving abandons the entire match
      await leaveMatch(matchId)
    } else {
      // Non-host only removes themselves
      await leaveMatchAsPlayer(matchId, myPlayer.id)
    }
    router.push('/lobby')
  }

  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    if (match.code) {
      navigator.clipboard.writeText(match.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className='mx-auto flex max-w-sm flex-1 flex-col items-center justify-center'>
      {/* Header */}
      <h1 className='mb-4 text-2xl font-bold'>Match Code</h1>

      {/* Match Code */}
      <button
        onClick={copyCode}
        className='mb-16 flex w-full cursor-copy items-center gap-4 rounded-2xl border px-8 py-4'
      >
        <span className='text-4xl font-black tracking-[1rem]'>
          {match.code ?? '----'}
        </span>
        <span>{copied ? <CheckIcon /> : <CopyIcon />}</span>
      </button>

      {/* Players */}
      <div className='mb-8 w-full'>
        <p className='text-muted-foreground mb-4 text-center text-xs font-medium tracking-wider uppercase'>
          Players {match.players.length}/{match.max_players}
        </p>
        <div className='flex flex-col gap-4'>
          <PlayerSlot
            name={
              myPlayer.player_order === 1
                ? myPlayer.player_name
                : opponent?.player_name
            }
            isHost
          />
          <PlayerSlot
            name={
              myPlayer.player_order === 2
                ? myPlayer.player_name
                : opponent?.player_name
            }
          />
        </div>
      </div>

      {/* Actions */}
      <div className='flex w-full flex-col gap-4'>
        {canStart ? (
          <Button onClick={handleStartGame} size='lg' className='w-full'>
            <PlayIcon className='size-4' />
            Start Game
          </Button>
        ) : (
          <>
            <p className='text-muted-foreground text-center text-sm'>
              {!opponent && isHost && 'Share the code with your friend!'}
              {opponent && !isHost && 'Waiting for host to start...'}
            </p>
            <Button
              variant='ghost'
              onClick={handleLeaveMatch}
              className='w-full'
            >
              Leave Match
            </Button>
          </>
        )}
      </div>

      <ConnectionIndicator isConnected={isConnected} />
    </div>
  )
}

function PlayerSlot({ name, isHost }: { name?: string; isHost?: boolean }) {
  const isEmpty = !name

  return (
    <div
      className={cn(
        `flex items-center gap-4 rounded-2xl border p-4`,
        isEmpty ? 'border-dashed' : 'border',
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          `flex size-10 items-center justify-center rounded-full`,
          isEmpty
            ? 'bg-muted text-muted-foreground'
            : 'bg-primary text-primary-foreground',
        )}
      >
        {isHost ? (
          <CrownIcon className='size-4' />
        ) : (
          <UserIcon className='size-4' />
        )}
      </div>

      {/* Info */}
      <div className='min-w-0 flex-1'>
        {isEmpty ? (
          <p className='text-muted-foreground text-sm'>Waiting...</p>
        ) : (
          <>
            <p className='truncate font-semibold'>{name}</p>
            <p className='text-muted-foreground text-xs'>
              {isHost ? 'Host' : 'Player'}
            </p>
          </>
        )}
      </div>

      {/* Status */}
      {!isEmpty && (
        <div className='size-2 animate-pulse rounded-full bg-green-500' />
      )}
    </div>
  )
}
