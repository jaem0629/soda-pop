'use client'

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    type ReactNode,
} from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useRealtime } from '@/hooks/use-realtime'
import { useGameTimer } from '@/hooks/use-game-timer'
import { useMatchLoader, getRestoredGameState } from '@/hooks/use-match-loader'
import {
    updatePlayerScore,
    finishMatch,
    startMatch,
    leaveMatch,
    GAME_DURATION,
    type MatchWithPlayers,
    type MatchPlayer,
} from '@/lib/match'

type PlayerInfo = {
    matchId: string
    playerId: string
    playerOrder: number
    nickname: string
}

type GameContextType = {
    // Player Info
    playerInfo: PlayerInfo | null

    // Match State
    match: MatchWithPlayers | null
    myPlayer: MatchPlayer | undefined
    opponent: MatchPlayer | undefined
    isLoading: boolean

    // Scores
    myScore: number
    opponentScore: number

    // Timer
    timeLeft: number
    isExpired: boolean

    // Connection
    isConnected: boolean

    // Game Status
    gameStatus: 'waiting' | 'playing' | 'finished' | 'abandoned'
    isFinished: boolean
    canStart: boolean

    // Actions
    handleStartGame: () => Promise<void>
    handleScoreChange: (score: number) => void
    navigateToResult: () => void
}

const GameContext = createContext<GameContextType | null>(null)

export function useGameContext() {
    const context = useContext(GameContext)
    if (!context) {
        throw new Error('useGameContext must be used within GameProvider')
    }
    return context
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

export function GameProvider({ children }: { children: ReactNode }) {
    const params = useParams()
    const router = useRouter()
    const matchId = params.roomId as string

    const [playerInfo] = useState<PlayerInfo | null>(() =>
        loadPlayerInfo(matchId)
    )

    // Redirect if no player info
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

    // Scores: null = server value, number = local change
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

    // Sync timer with match state
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

    // Realtime event handler
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
                router.push(`/game/${matchId}/play`)
                break
            case 'score_update':
                if (event.playerNumber !== playerInfo?.playerOrder) {
                    setLocalOpponentScore(event.score ?? 0)
                }
                break
            case 'game_end':
                reloadMatch()
                router.push(`/game/${matchId}/result`)
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

    // Send player joined event
    useEffect(() => {
        if (playerInfo && playerInfo.playerOrder > 1 && isConnected) {
            sendPlayerJoined(playerInfo.nickname)
        }
    }, [playerInfo, isConnected, sendPlayerJoined])

    // Send game end event
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

    // Leave match on unmount if waiting and host
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

    // Actions
    const handleStartGame = async () => {
        if (
            !myPlayer?.is_host ||
            !match ||
            match.players.length < match.max_players
        ) {
            return
        }

        timer.reset()

        const updatedMatch = await startMatch(matchId)
        if (updatedMatch) {
            setMatch((prev) => (prev ? { ...prev, ...updatedMatch } : null))
            timer.start()
            sendGameStart()
            router.push(`/game/${matchId}/play`)
        }
    }

    const handleScoreChange = (score: number) => {
        setLocalMyScore(score)
        sendScore(score)
        if (playerInfo) {
            updatePlayerScore(matchId, playerInfo.playerOrder, score)
        }
    }

    const navigateToResult = () => {
        router.push(`/game/${matchId}/result`)
    }

    const gameStatus = match?.status ?? 'waiting'
    const isFinished = gameStatus === 'finished' || gameEnded
    const canStart =
        !!myPlayer?.is_host &&
        (match?.players.length ?? 0) >= (match?.max_players ?? 2)

    const value: GameContextType = {
        playerInfo,
        match,
        myPlayer,
        opponent,
        isLoading,
        myScore: displayMyScore,
        opponentScore: displayOpponentScore,
        timeLeft: timer.timeLeft,
        isExpired: timer.isExpired,
        isConnected,
        gameStatus,
        isFinished,
        canStart,
        handleStartGame,
        handleScoreChange,
        navigateToResult,
    }

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
