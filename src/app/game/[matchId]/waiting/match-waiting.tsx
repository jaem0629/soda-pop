'use client'

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
  const {
    isConnected,
    sendGameStart,
    sendPlayerJoined,
    sendMatchAbandoned,
    subscribe,
  } = useRealtimeContext()

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

  useRealtimeDB({
    table: 'match_players',
    filter: `match_id=eq.${matchId}`,
    onUpdate: reloadMatch,
  })

  useEffect(() => {
    const unsubscribe = subscribe((event: GameEvent) => {
      switch (event.type) {
        case 'game_start':
          router.push(`/game/${matchId}/playing`)
          break
        case 'match_abandoned':
          router.push('/lobby')
          break
      }
    })

    return unsubscribe
  }, [subscribe, matchId, router])

  useEffect(() => {
    if (isConnected && !isHost) {
      sendPlayerJoined(myPlayer.player_name)
    }
  }, [isConnected, isHost, sendPlayerJoined, myPlayer.player_name])

  const handleStartGame = async () => {
    if (!canStart) return

    const updatedMatch = await startMatch(matchId)
    if (updatedMatch) {
      sendGameStart()
      router.push(`/game/${matchId}/playing`)
    }
  }

  const handleLeaveMatch = async () => {
    if (isHost) {
      sendMatchAbandoned()
      await leaveMatch(matchId)
    } else {
      await leaveMatchAsPlayer(matchId)
    }
    router.push('/lobby')
  }

  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    if (!match.code) return
    try {
      await navigator.clipboard.writeText(match.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available or permission denied
    }
  }

  return (
    <div className='mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-10'>
      {/* Match Code */}
      <div className='flex w-full flex-col items-center gap-2'>
        <p className='text-xs font-semibold tracking-widest text-white/40 uppercase'>
          Match Code
        </p>
        <button
          onClick={copyCode}
          className='group flex w-full items-center justify-center gap-4 rounded-2xl px-8 py-4'
        >
          <span className='text-4xl font-black tracking-widest text-blue-400'>
            {match.code ?? '----'}
          </span>
          <span className='text-white/30 transition-colors group-hover:text-white/60'>
            {copied ? (
              <CheckIcon className='size-5' />
            ) : (
              <CopyIcon className='size-5' />
            )}
          </span>
        </button>
      </div>

      {/* Players */}
      <div className='w-full'>
        <p className='mb-4 text-center text-xs font-semibold tracking-widest text-white/40 uppercase'>
          Players {match.players.length}/{match.max_players}
        </p>
        <div className='flex flex-col gap-3'>
          <PlayerSlot
            name={
              myPlayer.player_order === 1
                ? myPlayer.player_name
                : opponent?.player_name
            }
            isHost
          />

          <div className='flex items-center gap-4 px-4'>
            <div className='h-px flex-1 bg-white/10' />
            <span className='text-xs font-bold text-white/20'>VS</span>
            <div className='h-px flex-1 bg-white/10' />
          </div>

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
      <div className='flex w-full gap-8'>
        <button
          onClick={handleLeaveMatch}
          className='w-full rounded-2xl bg-white/10 py-3 text-sm font-semibold transition-colors hover:bg-white/20'
        >
          Leave Match
        </button>

        <button
          onClick={handleStartGame}
          disabled={!canStart}
          className='flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-linear-to-r from-blue-500 to-purple-500 text-lg font-bold transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-50'
        >
          <PlayIcon className='size-5' />
          Start Game
        </button>
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
        'flex items-center gap-4 rounded-2xl p-4',
        isEmpty ? 'border border-dashed border-white/10' : 'bg-white/5',
      )}
    >
      <div
        className={cn(
          'flex size-10 items-center justify-center rounded-full',
          isEmpty
            ? 'bg-white/10 text-white/30'
            : isHost
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-blue-500/20 text-blue-400',
        )}
      >
        {isHost ? (
          <CrownIcon className='size-5' />
        ) : (
          <UserIcon className='size-5' />
        )}
      </div>

      <div className='min-w-0 flex-1'>
        {isEmpty ? (
          <p className='text-sm text-white/30'>Waiting...</p>
        ) : (
          <>
            <p className='truncate font-semibold'>{name}</p>
            <p className='text-xs text-white/40'>
              {isHost ? 'Host' : 'Player'}
            </p>
          </>
        )}
      </div>

      {!isEmpty && (
        <div className='size-2 animate-pulse rounded-full bg-green-400' />
      )}
    </div>
  )
}
