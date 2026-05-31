'use client'

import {
  RealtimeProvider,
  useRealtimeContext,
  type GameEvent,
} from '@/contexts/realtime-context'
import { useAutoSave } from '@/hooks/use-auto-save'
import { useGameTimer } from '@/hooks/use-game-timer'
import { formatTime } from '@/lib/date'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import ConnectionIndicator from '../_components/connection-indicator'
import GameBoard from '../_components/game-board'
import { finishMatch, updatePlayerScore } from '../_lib/actions'
import { GAME_DURATION } from '../_lib/game-logic'
import type { GameMode, MatchPlayer, MatchWithPlayers } from '../_lib/types'

interface MatchPlayingProps {
  matchId: string
  userId: string
  mode: GameMode
  initialMatch: MatchWithPlayers
  initialPlayer: MatchPlayer
  initialOpponent: MatchPlayer | undefined
  initialTimeLeft: number
}

export default function MatchPlaying(props: MatchPlayingProps) {
  if (props.mode === 'solo') {
    return <SoloPlayingContent {...props} />
  }

  return (
    <RealtimeProvider
      matchId={props.matchId}
      playerNumber={props.initialPlayer.player_order}
    >
      <BattlePlayingContent {...props} />
    </RealtimeProvider>
  )
}

function SoloPlayingContent({
  matchId,
  initialPlayer,
  initialTimeLeft,
}: MatchPlayingProps) {
  const router = useRouter()

  const [myScore, setMyScore] = useState(initialPlayer.score)
  const gameEndSentRef = useRef(false)
  const scoreRef = useRef(initialPlayer.score)

  const saveMyScore = useCallback(async () => {
    if (gameEndSentRef.current) return false
    gameEndSentRef.current = true
    return await updatePlayerScore(
      matchId,
      initialPlayer.player_order,
      scoreRef.current,
    )
  }, [matchId, initialPlayer.player_order])

  const timer = useGameTimer({
    duration: GAME_DURATION,
    onExpire: async () => {
      if (!(await saveMyScore())) return
      await finishMatch(matchId)
      router.push(`/game/${matchId}/finished`)
    },
    autoStart: true,
    initialElapsed: GAME_DURATION - initialTimeLeft,
  })

  useAutoSave({
    getData: () => scoreRef.current,
    onSave: async (score) => {
      await updatePlayerScore(matchId, initialPlayer.player_order, score)
    },
    intervalMs: 10000,
    saveOnUnload: true,
    enabled: !timer.isExpired,
    isEqual: (prev, current) => prev === current,
  })

  const handleScoreChange = (score: number) => {
    setMyScore(score)
    scoreRef.current = score
  }

  const isUrgent = timer.timeLeft <= 10

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <div className='shrink-0 px-2 py-2 sm:px-4 sm:py-3'>
        <div className='flex flex-col items-center gap-1'>
          <p
            className={cn(
              'text-3xl font-black tabular-nums transition-colors sm:text-4xl',
              isUrgent && 'animate-pulse text-red-400',
            )}
          >
            {formatTime(timer.timeLeft)}
          </p>
          <p className='bg-linear-to-r from-green-400 to-emerald-300 bg-clip-text text-2xl font-black text-transparent tabular-nums sm:text-3xl'>
            {myScore.toLocaleString()}
          </p>
        </div>
      </div>

      <main className='min-h-0 flex-1 px-2 pb-2 sm:px-4 sm:pb-4'>
        <GameBoard
          onScoreChange={handleScoreChange}
          disabled={timer.isExpired}
          initialScore={myScore}
        />
      </main>
    </div>
  )
}

function BattlePlayingContent({
  matchId,
  initialPlayer,
  initialOpponent,
  initialTimeLeft,
}: MatchPlayingProps) {
  const router = useRouter()
  const { isConnected, sendScore, sendGameEnd, subscribe } =
    useRealtimeContext()

  const [myScore, setMyScore] = useState(initialPlayer.score)
  const [opponentScore, setOpponentScore] = useState(
    initialOpponent?.score ?? 0,
  )

  const gameEndSentRef = useRef(false)
  const scoreRef = useRef(initialPlayer.score)

  const saveMyScore = useCallback(async () => {
    if (gameEndSentRef.current) return false
    gameEndSentRef.current = true
    return await updatePlayerScore(
      matchId,
      initialPlayer.player_order,
      scoreRef.current,
    )
  }, [matchId, initialPlayer.player_order])

  const timer = useGameTimer({
    duration: GAME_DURATION,
    onExpire: async () => {
      if (!(await saveMyScore())) return
      await finishMatch(matchId)
      sendGameEnd()
      router.push(`/game/${matchId}/finished`)
    },
    autoStart: true,
    initialElapsed: GAME_DURATION - initialTimeLeft,
  })

  useAutoSave({
    getData: () => scoreRef.current,
    onSave: async (score) => {
      await updatePlayerScore(matchId, initialPlayer.player_order, score)
    },
    intervalMs: 10000,
    saveOnUnload: true,
    enabled: !timer.isExpired,
    isEqual: (prev, current) => prev === current,
  })

  useEffect(() => {
    const unsubscribe = subscribe((event: GameEvent) => {
      switch (event.type) {
        case 'score_update':
          if (event.playerNumber !== initialPlayer.player_order) {
            setOpponentScore(event.score)
          }
          break
        case 'game_end':
          saveMyScore()
          router.push(`/game/${matchId}/finished`)
          break
      }
    })

    return unsubscribe
  }, [subscribe, initialPlayer.player_order, matchId, router, saveMyScore])

  const handleScoreChange = (score: number) => {
    setMyScore(score)
    scoreRef.current = score
    sendScore(score)
  }

  const isUrgent = timer.timeLeft <= 10
  const isLeading = myScore > opponentScore
  const isTied = myScore === opponentScore

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <div className='shrink-0 px-2 py-2 sm:px-4 sm:py-3'>
        <div className='grid grid-cols-3 items-center gap-2 sm:flex sm:gap-3'>
          <div className='flex min-w-0 flex-1 items-center gap-2'>
            <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-500 text-xs font-bold'>
              {initialPlayer.player_name.charAt(0).toUpperCase()}
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex items-baseline justify-between'>
                <p className='truncate text-xs text-white/40'>
                  {initialPlayer.player_name}
                </p>
                <p className='text-sm font-black tabular-nums'>
                  {myScore.toLocaleString()}
                </p>
              </div>
              <div className='mt-1 flex h-2 overflow-hidden rounded-full bg-white/10'>
                <div
                  className={cn(
                    'ml-auto rounded-full transition-all duration-500',
                    isLeading
                      ? 'bg-linear-to-r from-blue-500 to-purple-500'
                      : isTied
                        ? 'bg-white/30'
                        : 'bg-red-500/60',
                  )}
                  style={{
                    width: `${myScore + opponentScore === 0 ? 0 : (myScore / Math.max(myScore, opponentScore)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className='flex shrink-0 flex-col items-center px-1 sm:px-8'>
            <p
              className={cn(
                'text-2xl font-black tabular-nums transition-colors sm:text-3xl',
                isUrgent && 'animate-pulse text-red-400',
              )}
            >
              {formatTime(timer.timeLeft)}
            </p>
          </div>

          <div className='flex min-w-0 flex-1 items-center gap-2'>
            <div className='min-w-0 flex-1'>
              <div className='flex items-baseline justify-between'>
                <p className='text-sm font-black tabular-nums'>
                  {opponentScore.toLocaleString()}
                </p>
                <p className='truncate text-xs text-white/40'>
                  {initialOpponent?.player_name ?? 'Opponent'}
                </p>
              </div>
              <div className='mt-1 flex h-2 overflow-hidden rounded-full bg-white/10'>
                <div
                  className='rounded-full bg-white/30 transition-all duration-500'
                  style={{
                    width: `${myScore + opponentScore === 0 ? 0 : (opponentScore / Math.max(myScore, opponentScore)) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/50'>
              {initialOpponent?.player_name?.charAt(0).toUpperCase() ?? '?'}
            </div>
          </div>
        </div>
      </div>

      <main className='min-h-0 flex-1 px-2 pb-2 sm:px-4 sm:pb-4'>
        <GameBoard
          onScoreChange={handleScoreChange}
          disabled={timer.isExpired}
          initialScore={myScore}
        />
      </main>

      <ConnectionIndicator isConnected={isConnected} />
    </div>
  )
}
