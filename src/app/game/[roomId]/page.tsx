'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import GameBoard from '@/components/game-board'
import { useRealtime } from '@/hooks/use-realtime'
import {
    getMatch,
    updatePlayerScore,
    finishMatch,
    startMatch,
    calculateTimeLeft,
    leaveMatch,
    getOpponent,
    GAME_DURATION,
    type MatchWithPlayers,
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
    const [match, setMatch] = useState<MatchWithPlayers | null>(null)
    const [opponentScore, setOpponentScore] = useState(0)
    const [myScore, setMyScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
    const [gameEnded, setGameEnded] = useState(false)

    const scoreInitializedRef = useRef(false)
    const gameEndedRef = useRef(false)
    const [gameStartTime, setGameStartTime] = useState<number | null>(null)

    const gameStatus = match?.status ?? 'waiting'

    // 내 정보와 상대 정보
    const myPlayer = match?.players.find(
        (p) => p.player_order === playerInfo?.playerOrder
    )
    const opponent = match
        ? getOpponent(match.players, playerInfo?.playerOrder ?? 1)
        : undefined

    // 플레이어 정보 없으면 리다이렉트
    useEffect(() => {
        if (!playerInfo) {
            router.push('/')
        }
    }, [playerInfo, router])

    // 방 정보 로드
    useEffect(() => {
        if (!matchId || !playerInfo) return

        const loadMatch = async () => {
            const matchData = await getMatch(matchId)
            if (!matchData) {
                router.push('/')
                return
            }

            setMatch(matchData)

            // 새로고침 시 점수 및 시간 복원
            if (
                matchData.status === 'playing' &&
                !scoreInitializedRef.current
            ) {
                scoreInitializedRef.current = true

                const me = matchData.players.find(
                    (p) => p.player_order === playerInfo.playerOrder
                )
                const opp = getOpponent(
                    matchData.players,
                    playerInfo.playerOrder
                )

                if (me) setMyScore(me.score)
                if (opp) setOpponentScore(opp.score)

                // 서버 시간 기준 남은 시간 복원
                if (matchData.started_at) {
                    const remaining = calculateTimeLeft(matchData.started_at)
                    setTimeLeft(remaining)

                    if (remaining > 0) {
                        setGameStartTime(
                            Date.now() - (GAME_DURATION - remaining) * 1000
                        )
                    }
                }
            }

            // 이미 종료된 게임
            if (matchData.status === 'finished' && !gameEndedRef.current) {
                gameEndedRef.current = true
                setGameEnded(true)
            }
        }

        loadMatch()

        // 대기 중일 때만 폴링
        if (gameStatus === 'waiting') {
            const interval = setInterval(loadMatch, 2000)
            return () => clearInterval(interval)
        }
    }, [matchId, router, playerInfo, gameStatus])

    // 타이머 (로컬 시간 기준)
    useEffect(() => {
        if (gameStatus !== 'playing' || !gameStartTime || gameEndedRef.current)
            return

        const timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - gameStartTime) / 1000)
            const remaining = Math.max(0, GAME_DURATION - elapsed)
            setTimeLeft(remaining)

            if (remaining <= 0 && !gameEndedRef.current) {
                gameEndedRef.current = true
                setGameEnded(true)
                clearInterval(timer)
                finishMatch(matchId)
            }
        }, 100)

        return () => clearInterval(timer)
    }, [gameStatus, gameStartTime, matchId])

    // 실시간 이벤트 처리
    const handleRealtimeEvent = (event: {
        type: string
        playerNumber?: number
        score?: number
        playerName?: string
    }) => {
        switch (event.type) {
            case 'player_joined':
                getMatch(matchId).then((matchData) => {
                    if (matchData) setMatch(matchData)
                })
                break

            case 'game_start':
                gameEndedRef.current = false
                setGameEnded(false)
                setTimeLeft(GAME_DURATION)
                setGameStartTime(Date.now())
                getMatch(matchId).then((matchData) => {
                    if (matchData) setMatch(matchData)
                })
                break

            case 'score_update':
                if (event.playerNumber !== playerInfo?.playerOrder) {
                    setOpponentScore(event.score ?? 0)
                }
                break

            case 'game_end':
                gameEndedRef.current = true
                setGameEnded(true)
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

    // 게임 시작 (호스트만)
    const handleStartGame = async () => {
        if (
            !myPlayer?.is_host ||
            !match ||
            match.players.length < match.max_players
        )
            return

        gameEndedRef.current = false
        setGameEnded(false)
        setTimeLeft(GAME_DURATION)

        const updatedMatch = await startMatch(matchId)
        if (updatedMatch) {
            setMatch((prev) => (prev ? { ...prev, ...updatedMatch } : null))
            setGameStartTime(Date.now())
            sendGameStart()
        }
    }

    // 점수 변경 핸들러
    const handleScoreChange = (score: number) => {
        setMyScore(score)
        sendScore(score)
        if (playerInfo) {
            updatePlayerScore(matchId, playerInfo.playerOrder, score)
        }
    }

    // 게임 종료 시 상대방에게 알림
    useEffect(() => {
        if (gameEnded) {
            sendGameEnd()
        }
    }, [gameEnded, sendGameEnd])

    // 페이지 떠날 때 방 정리
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

    // 로딩 중
    if (!playerInfo || !match) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-[#0f0f23]'>
                <p className='text-white'>로딩 중...</p>
            </div>
        )
    }

    const isFinished = gameStatus === 'finished' || gameEnded
    const canStart =
        myPlayer?.is_host && match.players.length >= match.max_players

    return (
        <div className='flex min-h-screen flex-col items-center bg-[#0f0f23] p-4'>
            {/* 헤더 */}
            <div className='mb-4 w-full max-w-2xl'>
                <div className='flex items-center justify-between rounded-xl bg-[#1a1a2e] p-4'>
                    <div className='text-center'>
                        <p className='text-sm text-gray-400'>나</p>
                        <p className='font-bold text-white'>
                            {playerInfo.nickname}
                        </p>
                        <p className='text-2xl font-bold text-yellow-400'>
                            {myScore}
                        </p>
                    </div>

                    <div className='text-center'>
                        {gameStatus === 'waiting' && (
                            <p className='text-gray-400'>대기 중</p>
                        )}
                        {gameStatus === 'playing' && !isFinished && (
                            <p
                                className={`text-4xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-white'}`}>
                                {timeLeft}
                            </p>
                        )}
                        {isFinished && (
                            <p className='text-2xl font-bold text-purple-400'>
                                종료!
                            </p>
                        )}
                    </div>

                    <div className='text-center'>
                        <p className='text-sm text-gray-400'>상대</p>
                        <p className='font-bold text-white'>
                            {opponent?.player_name ?? '???'}
                        </p>
                        <p className='text-2xl font-bold text-pink-400'>
                            {opponentScore}
                        </p>
                    </div>
                </div>
            </div>

            {/* 대기 화면 */}
            {gameStatus === 'waiting' && (
                <div className='flex flex-col items-center gap-4 rounded-2xl bg-[#1a1a2e] p-8'>
                    <p className='text-xl text-white'>방 코드</p>
                    <p className='text-4xl font-bold tracking-widest text-purple-400'>
                        {match.code}
                    </p>
                    <p className='text-gray-400'>
                        이 코드를 상대방에게 공유하세요
                    </p>

                    {!opponent && (
                        <div className='mt-4 flex items-center gap-2 text-gray-400'>
                            <div className='h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent' />
                            상대방 대기 중...
                        </div>
                    )}

                    {canStart && (
                        <button
                            onClick={handleStartGame}
                            className='mt-4 rounded-xl bg-linear-to-r from-green-500 to-emerald-500 px-8 py-4 font-bold text-white transition-all hover:from-green-600 hover:to-emerald-600'>
                            게임 시작!
                        </button>
                    )}

                    {opponent && !myPlayer?.is_host && (
                        <p className='mt-4 text-gray-400'>
                            방장이 게임을 시작합니다...
                        </p>
                    )}
                </div>
            )}

            {/* 게임 화면 */}
            {gameStatus === 'playing' && !isFinished && (
                <GameBoard
                    onScoreChange={handleScoreChange}
                    disabled={false}
                    initialScore={myScore}
                />
            )}

            {/* 결과 화면 */}
            {isFinished && (
                <div className='flex flex-col items-center gap-4 rounded-2xl bg-[#1a1a2e] p-8'>
                    <p className='text-3xl font-bold text-white'>
                        {myScore > opponentScore
                            ? '🎉 승리!'
                            : myScore < opponentScore
                              ? '😢 패배'
                              : '🤝 무승부'}
                    </p>

                    <div className='flex gap-8 text-center'>
                        <div>
                            <p className='text-gray-400'>
                                {playerInfo.nickname}
                            </p>
                            <p className='text-3xl font-bold text-yellow-400'>
                                {myScore}
                            </p>
                        </div>
                        <div className='text-3xl font-bold text-gray-600'>
                            vs
                        </div>
                        <div>
                            <p className='text-gray-400'>
                                {opponent?.player_name}
                            </p>
                            <p className='text-3xl font-bold text-pink-400'>
                                {opponentScore}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/')}
                        className='mt-4 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 px-8 py-4 font-bold text-white transition-all hover:from-purple-600 hover:to-pink-600'>
                        메인으로
                    </button>
                </div>
            )}

            {/* 연결 상태 */}
            <div className='fixed right-4 bottom-4'>
                <div
                    className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                />
            </div>
        </div>
    )
}
