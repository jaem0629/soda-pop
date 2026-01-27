'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import GameBoard from '@/components/game-board'
import { useRealtime } from '@/hooks/use-realtime'
import {
    getRoom,
    updateScore,
    finishGame,
    startGame,
    calculateTimeLeft,
    leaveRoom,
    GAME_DURATION,
    type Room,
} from '@/lib/room'

type PlayerInfo = {
    roomId: string
    playerNumber: 1 | 2
    nickname: string
}

function loadPlayerInfo(roomId: string): PlayerInfo | null {
    if (typeof window === 'undefined') return null

    const stored = localStorage.getItem('player')
    if (!stored) return null

    try {
        const info = JSON.parse(stored) as PlayerInfo
        if (info.roomId !== roomId) return null
        return info
    } catch {
        return null
    }
}

export default function GamePage() {
    const params = useParams()
    const router = useRouter()
    const roomId = params.roomId as string

    const [playerInfo] = useState<PlayerInfo | null>(() =>
        loadPlayerInfo(roomId)
    )
    const [room, setRoom] = useState<Room | null>(null)
    const [opponentScore, setOpponentScore] = useState(0)
    const [myScore, setMyScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
    const [gameEnded, setGameEnded] = useState(false)

    const scoreInitializedRef = useRef(false)
    const gameEndedRef = useRef(false)
    const [gameStartTime, setGameStartTime] = useState<number | null>(null) // 로컬 시간 기준

    const gameStatus = room?.status ?? 'waiting'

    // 플레이어 정보 없으면 리다이렉트
    useEffect(() => {
        if (!playerInfo) {
            router.push('/')
        }
    }, [playerInfo, router])

    // 방 정보 로드 (대기 중일 때만 폴링, 게임 중에는 초기 1회)
    useEffect(() => {
        if (!roomId || !playerInfo) return

        const loadRoom = async () => {
            const roomData = await getRoom(roomId)
            if (!roomData) {
                router.push('/')
                return
            }

            setRoom(roomData)

            // 새로고침 시 점수 및 시간 복원 (scoreInitializedRef로 1회만 실행)
            if (roomData.status === 'playing' && !scoreInitializedRef.current) {
                scoreInitializedRef.current = true

                const myDbScore =
                    playerInfo.playerNumber === 1
                        ? roomData.player1_score
                        : roomData.player2_score
                const opponentDbScore =
                    playerInfo.playerNumber === 1
                        ? roomData.player2_score
                        : roomData.player1_score

                setMyScore(myDbScore)
                setOpponentScore(opponentDbScore)

                // 서버 시간 기준 남은 시간 복원 (새로고침 시)
                if (roomData.started_at) {
                    const remaining = calculateTimeLeft(roomData.started_at)
                    setTimeLeft(remaining)

                    // 로컬 타이머 시작점 역산 (남은시간 기준)
                    if (remaining > 0) {
                        setGameStartTime(
                            Date.now() - (GAME_DURATION - remaining) * 1000
                        )
                    }
                }
            }

            // 이미 종료된 게임이면 (DB status가 finished)
            if (roomData.status === 'finished' && !gameEndedRef.current) {
                gameEndedRef.current = true
                setGameEnded(true)
            }
        }

        loadRoom()

        // 대기 중일 때만 폴링 (상대방 입장 감지)
        if (gameStatus === 'waiting') {
            const interval = setInterval(loadRoom, 2000)
            return () => clearInterval(interval)
        }
    }, [roomId, router, playerInfo, gameStatus])

    // 타이머 (게임 중에만) - 로컬 시간 기준
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
                finishGame(roomId)
            }
        }, 100)

        return () => clearInterval(timer)
    }, [gameStatus, gameStartTime, roomId])

    // 실시간 이벤트 처리
    const handleRealtimeEvent = useCallback(
        (event: {
            type: string
            playerNumber?: 1 | 2
            score?: number
            playerName?: string
        }) => {
            switch (event.type) {
                case 'player_joined':
                    getRoom(roomId).then((roomData) => {
                        if (roomData) setRoom(roomData)
                    })
                    break

                case 'game_start':
                    gameEndedRef.current = false
                    setGameEnded(false)
                    setTimeLeft(GAME_DURATION)
                    setGameStartTime(Date.now()) // 로컬 시간 기준!
                    getRoom(roomId).then((roomData) => {
                        if (roomData) setRoom(roomData)
                    })
                    break

                case 'score_update':
                    if (event.playerNumber !== playerInfo?.playerNumber) {
                        setOpponentScore(event.score ?? 0)
                    }
                    break

                case 'game_end':
                    gameEndedRef.current = true
                    setGameEnded(true)
                    break
            }
        },
        [roomId, playerInfo?.playerNumber]
    )

    const {
        isConnected,
        sendScore,
        sendGameStart,
        sendGameEnd,
        sendPlayerJoined,
    } = useRealtime({
        roomId,
        playerNumber: playerInfo?.playerNumber ?? 1,
        onEvent: handleRealtimeEvent,
    })

    // 플레이어2 입장 시 알림
    useEffect(() => {
        if (playerInfo?.playerNumber === 2 && isConnected) {
            sendPlayerJoined(playerInfo.nickname)
        }
    }, [playerInfo, isConnected, sendPlayerJoined])

    // 게임 시작 (플레이어1만)
    const handleStartGame = async () => {
        if (playerInfo?.playerNumber !== 1 || !room?.player2_name) return

        gameEndedRef.current = false
        setGameEnded(false)
        setTimeLeft(GAME_DURATION)

        const updatedRoom = await startGame(roomId)
        if (updatedRoom) {
            setRoom(updatedRoom)
            setGameStartTime(Date.now()) // 로컬 시간 기준!
            sendGameStart()
        }
    }

    // 점수 변경 핸들러
    const handleScoreChange = useCallback(
        (score: number) => {
            setMyScore(score)
            sendScore(score)
            if (playerInfo) {
                updateScore(roomId, playerInfo.playerNumber, score)
            }
        },
        [roomId, playerInfo, sendScore]
    )

    // 게임 종료 시 상대방에게 알림
    useEffect(() => {
        if (gameEnded) {
            sendGameEnd()
        }
    }, [gameEnded, sendGameEnd])

    // 페이지 떠날 때 방 정리
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (room?.status === 'waiting' && playerInfo?.playerNumber === 1) {
                leaveRoom(roomId)
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () =>
            window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [room?.status, playerInfo?.playerNumber, roomId])

    // 로딩 중
    if (!playerInfo || !room) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-[#0f0f23]'>
                <p className='text-white'>로딩 중...</p>
            </div>
        )
    }

    const opponentName =
        playerInfo.playerNumber === 1 ? room.player2_name : room.player1_name
    const isFinished = gameStatus === 'finished' || gameEnded

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
                            {opponentName ?? '???'}
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
                        {room.code}
                    </p>
                    <p className='text-gray-400'>
                        이 코드를 상대방에게 공유하세요
                    </p>

                    {!opponentName && (
                        <div className='mt-4 flex items-center gap-2 text-gray-400'>
                            <div className='h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent' />
                            상대방 대기 중...
                        </div>
                    )}

                    {opponentName && playerInfo.playerNumber === 1 && (
                        <button
                            onClick={handleStartGame}
                            className='mt-4 rounded-xl bg-linear-to-r from-green-500 to-emerald-500 px-8 py-4 font-bold text-white transition-all hover:from-green-600 hover:to-emerald-600'>
                            게임 시작!
                        </button>
                    )}

                    {opponentName && playerInfo.playerNumber === 2 && (
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
                            <p className='text-gray-400'>{opponentName}</p>
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
