'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import GameBoard from '@/components/game-board'
import { useRealtime } from '@/hooks/use-realtime'
import { getRoom, updateScore, finishGame } from '@/lib/room'
import type { Room } from '@/lib/room'

type PlayerInfo = {
    roomId: string
    playerNumber: 1 | 2
    nickname: string
}

const GAME_DURATION = 60 // 60초

// 플레이어 정보 로드 (컴포넌트 외부)
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

    // 초기값을 함수로 설정
    const [playerInfo] = useState<PlayerInfo | null>(() =>
        loadPlayerInfo(roomId)
    )
    const [room, setRoom] = useState<Room | null>(null)
    const [opponentScore, setOpponentScore] = useState(0)
    const [myScore, setMyScore] = useState(0)
    const [gameStatus, setGameStatus] = useState<
        'waiting' | 'playing' | 'finished'
    >('waiting')
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION)

    // 플레이어 정보 없으면 리다이렉트
    useEffect(() => {
        if (!playerInfo) {
            router.push('/')
        }
    }, [playerInfo, router])

    // 방 정보 로드
    useEffect(() => {
        if (!roomId) return

        const loadRoom = async () => {
            const roomData = await getRoom(roomId)
            if (roomData) {
                setRoom(roomData)
                if (roomData.status === 'playing') {
                    setGameStatus('playing')
                }
            }
        }

        loadRoom()

        // 방 상태 구독
        const interval = setInterval(loadRoom, 2000)
        return () => clearInterval(interval)
    }, [roomId])

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
                    // 상대방 입장 - 방 정보 다시 로드
                    getRoom(roomId).then((roomData) => {
                        if (roomData) setRoom(roomData)
                    })
                    break
                case 'game_start':
                    setGameStatus('playing')
                    break
                case 'score_update':
                    if (
                        event.playerNumber &&
                        event.playerNumber !== playerInfo?.playerNumber
                    ) {
                        setOpponentScore(event.score ?? 0)
                    }
                    break
                case 'game_end':
                    setGameStatus('finished')
                    break
            }
        },
        [roomId, playerInfo?.playerNumber]
    )

    const { isConnected, sendScore, sendGameStart, sendGameEnd, sendPlayerJoined } =
        useRealtime({
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
    const handleStartGame = () => {
        if (playerInfo?.playerNumber === 1 && room?.player2_name) {
            setGameStatus('playing')
            sendGameStart()
        }
    }

    // 타이머
    useEffect(() => {
        if (gameStatus !== 'playing') return

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    setGameStatus('finished')
                    sendGameEnd()
                    finishGame(roomId)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [gameStatus, roomId, sendGameEnd])

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

    return (
        <div className='flex min-h-screen flex-col items-center bg-[#0f0f23] p-4'>
            {/* 헤더 */}
            <div className='mb-4 w-full max-w-2xl'>
                <div className='flex items-center justify-between rounded-xl bg-[#1a1a2e] p-4'>
                    {/* 내 정보 */}
                    <div className='text-center'>
                        <p className='text-sm text-gray-400'>나</p>
                        <p className='font-bold text-white'>
                            {playerInfo.nickname}
                        </p>
                        <p className='text-2xl font-bold text-yellow-400'>
                            {myScore}
                        </p>
                    </div>

                    {/* 타이머 */}
                    <div className='text-center'>
                        {gameStatus === 'waiting' && (
                            <p className='text-gray-400'>대기 중</p>
                        )}
                        {gameStatus === 'playing' && (
                            <p
                                className={`text-4xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-white'}`}>
                                {timeLeft}
                            </p>
                        )}
                        {gameStatus === 'finished' && (
                            <p className='text-2xl font-bold text-purple-400'>
                                종료!
                            </p>
                        )}
                    </div>

                    {/* 상대 정보 */}
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
            {gameStatus === 'playing' && (
                <GameBoard
                    onScoreChange={handleScoreChange}
                    disabled={false}
                />
            )}

            {/* 결과 화면 */}
            {gameStatus === 'finished' && (
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
            <div className='fixed bottom-4 right-4'>
                <div
                    className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                />
            </div>
        </div>
    )
}
