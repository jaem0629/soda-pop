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

// ================================================
// 타입 정의
// ================================================

type PlayerInfo = {
    matchId: string
    playerId: string
    playerOrder: number
    nickname: string
}

// ================================================
// 헬퍼 함수
// ================================================

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

// ================================================
// 컴포넌트
// ================================================

export default function GamePage() {
    const params = useParams()
    const router = useRouter()
    const matchId = params.roomId as string

    // ------------------------------------------------
    // 플레이어 정보
    // ------------------------------------------------
    const [playerInfo] = useState<PlayerInfo | null>(() =>
        loadPlayerInfo(matchId)
    )

    // 플레이어 정보 없으면 리다이렉트
    useEffect(() => {
        if (!playerInfo) {
            router.push('/')
        }
    }, [playerInfo, router])

    // ------------------------------------------------
    // 매치 데이터
    // ------------------------------------------------
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

    // 복원 데이터 (순수 함수로 계산)
    const restored = getRestoredGameState(match, playerInfo?.playerOrder ?? 1)

    // ------------------------------------------------
    // 점수 상태 (로컬 변경분만 추적)
    // ------------------------------------------------
    // null = 아직 로컬 변경 없음 (서버 값 사용)
    // number = 로컬에서 변경된 값
    const [localMyScore, setLocalMyScore] = useState<number | null>(null)
    const [localOpponentScore, setLocalOpponentScore] = useState<number | null>(
        null
    )

    // 표시할 점수: 로컬 값이 있으면 로컬, 없으면 서버 복원값
    const displayMyScore = localMyScore ?? restored.myScore
    const displayOpponentScore = localOpponentScore ?? restored.opponentScore

    // ------------------------------------------------
    // 게임 타이머
    // ------------------------------------------------
    const timer = useGameTimer({
        duration: GAME_DURATION,
        onExpire: () => {
            // 타이머 만료 시 게임 종료 (훅 내부에서 1회만 호출됨)
            if (match?.status === 'playing') {
                finishMatch(matchId)
            }
        },
    })

    // 게임 종료 여부 (파생 상태)
    const gameEnded = match?.status === 'finished' || timer.isExpired

    // 게임 복원 시 타이머 시작 (최초 1회) - timer.start는 이벤트 핸들러처럼 동작
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

    // ------------------------------------------------
    // 실시간 통신
    // ------------------------------------------------
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
        playerNumber: (playerInfo?.playerOrder ?? 1) as 1 | 2,
        onEvent: handleRealtimeEvent,
    })

    // 플레이어2 입장 시 알림
    useEffect(() => {
        if (playerInfo && playerInfo.playerOrder > 1 && isConnected) {
            sendPlayerJoined(playerInfo.nickname)
        }
    }, [playerInfo, isConnected, sendPlayerJoined])

    // 게임 종료 시 상대방에게 알림
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

    // ------------------------------------------------
    // 게임 액션
    // ------------------------------------------------

    // 게임 시작 (호스트만)
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

    // 점수 변경
    const handleScoreChange = (score: number) => {
        setLocalMyScore(score)
        sendScore(score)
        if (playerInfo) {
            updatePlayerScore(matchId, playerInfo.playerOrder, score)
        }
    }

    // ------------------------------------------------
    // 페이지 이탈 처리
    // ------------------------------------------------
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

    // ------------------------------------------------
    // 렌더링
    // ------------------------------------------------

    // 로딩 중
    if (!playerInfo || isLoading || !match) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-[#0f0f23]'>
                <p className='text-white'>로딩 중...</p>
            </div>
        )
    }

    const gameStatus = match.status
    const isFinished = gameStatus === 'finished' || gameEnded
    const canStart =
        myPlayer?.is_host && match.players.length >= match.max_players

    return (
        <div className='flex min-h-screen flex-col items-center bg-[#0f0f23] p-4'>
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
