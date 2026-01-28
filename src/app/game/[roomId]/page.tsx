'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import GameBoard from '@/components/game-board'
import GameHeader from './_components/game-header'
import WaitingRoom from './_components/waiting-room'
import GameResult from './_components/game-result'
import ConnectionIndicator from './_components/connection-indicator'
import { useRealtime } from '@/hooks/use-realtime'
import { useGameTimer } from '@/hooks/use-game-timer'
import { useMatchLoader, getRestoredGameState } from '@/hooks/use-match-loader'
import {
    updatePlayerScore,
    finishMatch,
    startMatch,
    leaveMatch,
    GAME_DURATION,
} from '@/lib/match'

type PlayerInfo = {
    matchId: string
    playerId: string
    playerOrder: number
    nickname: string
}

function loadPlayerInfo(matchId: string): PlayerInfo | null {
    if (typeof window === 'undefined') return null

    const stored = localStorage.getItem('player')
    if (!stored) return null

    try {
        const info = JSON.parse(stored) as PlayerInfo
        if (info.matchId !== matchId) return null
        return info
    } catch {
        return null
    }
}

export default function GamePage() {
    const params = useParams()
    const router = useRouter()
    const matchId = params.roomId as string

    const [playerInfo] = useState<PlayerInfo | null>(() =>
        loadPlayerInfo(matchId)
    )

    useEffect(() => {
        if (!playerInfo) {
            router.push('/')
        }
    }, [playerInfo, router])

    const {
        match,
        myPlayer,
        opponent,
        isLoading,
        setMatch,
        reload: reloadMatch,
    } = useMatchLoader({
        matchId,
        playerOrder: playerInfo?.playerOrder ?? 1,
    })

    const restored = getRestoredGameState(match, playerInfo?.playerOrder ?? 1)

    // 점수: null = 서버 값, number = 로컬 변경값
    const [localMyScore, setLocalMyScore] = useState<number | null>(null)
    const [localOpponentScore, setLocalOpponentScore] = useState<number | null>(
        null
    )
    const displayMyScore = localMyScore ?? restored.myScore
    const displayOpponentScore = localOpponentScore ?? restored.opponentScore

    const timer = useGameTimer({
        duration: GAME_DURATION,
        onExpire: () => {
            if (match?.status === 'playing') {
                finishMatch(matchId)
            }
        },
    })

    const gameEnded = match?.status === 'finished' || timer.isExpired

    useEffect(() => {
        if (
            match?.status === 'playing' &&
            restored.elapsedSeconds > 0 &&
            !timer.isRunning &&
            !timer.isExpired
        ) {
            timer.start(restored.elapsedSeconds)
        }
    }, [match?.status, restored.elapsedSeconds, timer])

    const handleRealtimeEvent = (event: {
        type: string
        playerNumber?: number
        score?: number
        playerName?: string
    }) => {
        switch (event.type) {
            case 'player_joined':
                reloadMatch()
                break
            case 'game_start':
                timer.reset()
                timer.start()
                reloadMatch()
                break
            case 'score_update':
                if (event.playerNumber !== playerInfo?.playerOrder) {
                    setLocalOpponentScore(event.score ?? 0)
                }
                break
            case 'game_end':
                reloadMatch()
                break
        }
    }

    const {
        isConnected,
        sendScore,
        sendGameStart,
        sendGameEnd,
        sendPlayerJoined,
    } = useRealtime({
        roomId: matchId,
        playerNumber: playerInfo?.playerOrder ?? 1,
        onEvent: handleRealtimeEvent,
    })

    useEffect(() => {
        if (playerInfo && playerInfo.playerOrder > 1 && isConnected) {
            sendPlayerJoined(playerInfo.nickname)
        }
    }, [playerInfo, isConnected, sendPlayerJoined])

    const gameEndSentRef = useRef(false)
    useEffect(() => {
        if (gameEnded && !gameEndSentRef.current) {
            gameEndSentRef.current = true
            sendGameEnd()
        }
        if (!gameEnded) {
            gameEndSentRef.current = false
        }
    }, [gameEnded, sendGameEnd])

    const handleStartGame = async () => {
        if (
            !myPlayer?.is_host ||
            !match ||
            match.players.length < match.max_players
        )
            return

        timer.reset()

        const updatedMatch = await startMatch(matchId)
        if (updatedMatch) {
            setMatch((prev) => (prev ? { ...prev, ...updatedMatch } : null))
            timer.start()
            sendGameStart()
        }
    }

    const handleScoreChange = (score: number) => {
        setLocalMyScore(score)
        sendScore(score)
        if (playerInfo) {
            updatePlayerScore(matchId, playerInfo.playerOrder, score)
        }
    }

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (match?.status === 'waiting' && myPlayer?.is_host) {
                leaveMatch(matchId)
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () =>
            window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [match?.status, myPlayer?.is_host, matchId])

    if (!playerInfo || isLoading || !match) {
        return (
            <div className='flex min-h-svh items-center justify-center'>
                <p className='text-muted-foreground'>로딩 중...</p>
            </div>
        )
    }

    const gameStatus = match.status
    const isFinished = gameStatus === 'finished' || gameEnded
    const canStart =
        myPlayer?.is_host && match.players.length >= match.max_players

    return (
        <div className='flex min-h-svh flex-col items-center p-4'>
            <GameHeader
                myNickname={playerInfo.nickname}
                myScore={displayMyScore}
                opponentName={opponent?.player_name ?? null}
                opponentScore={displayOpponentScore}
                timeLeft={timer.timeLeft}
                status={gameStatus}
                isFinished={isFinished}
            />

            {gameStatus === 'waiting' && (
                <WaitingRoom
                    code={match.code}
                    hasOpponent={!!opponent}
                    isHost={!!myPlayer?.is_host}
                    canStart={!!canStart}
                    onStartGame={handleStartGame}
                />
            )}

            {gameStatus === 'playing' && !isFinished && (
                <GameBoard
                    onScoreChange={handleScoreChange}
                    disabled={false}
                    initialScore={displayMyScore}
                />
            )}

            {isFinished && (
                <GameResult
                    myNickname={playerInfo.nickname}
                    myScore={displayMyScore}
                    opponentName={opponent?.player_name ?? null}
                    opponentScore={displayOpponentScore}
                    onGoHome={() => router.push('/')}
                />
            )}

            <ConnectionIndicator isConnected={isConnected} />
        </div>
    )
}
