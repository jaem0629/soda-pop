'use client'

import {
  RealtimeProvider,
  useRealtimeContext,
  type GameEvent,
} from '@/contexts/realtime-context'
import { useAutoSave } from '@/hooks/use-auto-save'
import { useGameTimer } from '@/hooks/use-game-timer'
import { formatTime } from '@/lib/date'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import ConnectionIndicator from '../_components/connection-indicator'
import GameBoard from '../_components/game-board'
import { finishMatch, updatePlayerScore } from '../_lib/actions'
import { GAME_DURATION } from '../_lib/game-logic'
import type { MatchPlayer, MatchWithPlayers } from '../_lib/types'

interface PlayRoomProps {
  matchId: string
  userId: string
  initialMatch: MatchWithPlayers
  initialPlayer: MatchPlayer
  initialOpponent: MatchPlayer | undefined
  initialTimeLeft: number
}

export default function PlayRoom(props: PlayRoomProps) {
  return (
    <RealtimeProvider
      roomId={props.matchId}
      playerNumber={props.initialPlayer.player_order}
    >
      <PlayRoomContent {...props} />
    </RealtimeProvider>
  )
}

function PlayRoomContent({
  matchId,
  initialPlayer,
  initialOpponent,
  initialTimeLeft,
}: PlayRoomProps) {
  const router = useRouter()
  const { isConnected, sendScore, sendGameEnd, subscribe } =
    useRealtimeContext()

  // Local state
  const [myScore, setMyScore] = useState(initialPlayer.score)
  const [opponentScore, setOpponentScore] = useState(
    initialOpponent?.score ?? 0,
  )

  const gameEndSentRef = useRef(false)
  const scoreRef = useRef(initialPlayer.score)

  // Save score only once (returns true if saved, false if already saved)
  const saveMyScore = useCallback(() => {
    if (gameEndSentRef.current) return false
    gameEndSentRef.current = true
    updatePlayerScore(matchId, initialPlayer.player_order, scoreRef.current)
    return true
  }, [matchId, initialPlayer.player_order])

  // Timer - auto starts with elapsed time
  const timer = useGameTimer({
    duration: GAME_DURATION,
    onExpire: () => {
      if (!saveMyScore()) return
      finishMatch(matchId)
      sendGameEnd()
      router.push(`/game/${matchId}/result`)
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

  // Handle realtime events
  useEffect(() => {
    const unsubscribe = subscribe((event: GameEvent) => {
      switch (event.type) {
        case 'score_update':
          if (event.playerNumber !== initialPlayer.player_order) {
            setOpponentScore(event.score)
          }
          break
        case 'game_end':
          // Opponent finished first - save my score and navigate
          saveMyScore()
          router.push(`/game/${matchId}/result`)
          break
      }
    })

    return unsubscribe
  }, [subscribe, initialPlayer.player_order, matchId, router, saveMyScore])

  // Handle score change (save to database when game ends)
  const handleScoreChange = (score: number) => {
    setMyScore(score)
    scoreRef.current = score
    sendScore(score)
  }

  return (
    <div className='flex flex-1 flex-col'>
      {/* Game Header */}
      <header className='flex items-center justify-between border-b border-white/5 bg-[#0B1120]/80 px-4 py-3 backdrop-blur-md lg:px-6'>
        {/* Left - My Score */}
        <div className='flex items-center gap-3'>
          <div className='flex size-10 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white shadow-lg'>
            {initialPlayer.player_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className='text-sm font-medium text-slate-400'>
              {initialPlayer.player_name}
            </p>
            <p className='text-2xl font-black text-cyan-400 tabular-nums'>
              {myScore.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Center - Timer */}
        <div className='flex flex-col items-center'>
          <div
            className={`rounded-2xl border px-6 py-2 ${
              timer.timeLeft <= 10
                ? 'animate-pulse border-red-500/50 bg-red-500/20'
                : 'border-white/10 bg-[#162032]'
            }`}
          >
            <p
              className={`text-3xl font-black tabular-nums ${
                timer.timeLeft <= 10 ? 'text-red-400' : 'text-white'
              }`}
            >
              {formatTime(timer.timeLeft)}
            </p>
          </div>
          <p className='mt-1 text-xs font-bold tracking-wider text-slate-500 uppercase'>
            Time Left
          </p>
        </div>

        {/* Right - Opponent Score */}
        <div className='flex items-center gap-3'>
          <div className='text-right'>
            <p className='text-sm font-medium text-slate-400'>
              {initialOpponent?.player_name ?? 'Opponent'}
            </p>
            <p className='text-2xl font-black text-purple-400 tabular-nums'>
              {opponentScore.toLocaleString()}
            </p>
          </div>
          <div className='flex size-10 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-pink-600 text-sm font-bold text-white shadow-lg'>
            {initialOpponent?.player_name?.charAt(0).toUpperCase() ?? '?'}
          </div>
        </div>
      </header>

      {/* Score Comparison Bar */}
      <div className='border-b border-white/5 bg-[#162032]/50 px-4 py-2'>
        <div className='flex h-3 overflow-hidden rounded-full bg-slate-800'>
          <div
            className='bg-linear-to-r from-cyan-500 to-cyan-400 transition-all duration-300'
            style={{
              width: `${Math.max(5, (myScore / (myScore + opponentScore || 1)) * 100)}%`,
            }}
          />
          <div
            className='bg-linear-to-r from-purple-400 to-purple-500 transition-all duration-300'
            style={{
              width: `${Math.max(5, (opponentScore / (myScore + opponentScore || 1)) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Game Board */}
      <main className='flex flex-1 items-center justify-center p-4'>
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
