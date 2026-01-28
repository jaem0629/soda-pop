'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createMatch, joinMatch } from '@/lib/match'

export default function Home() {
    const router = useRouter()
    const [nickname, setNickname] = useState('')
    const [roomCode, setRoomCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [mode, setMode] = useState<'select' | 'create' | 'join'>('select')

    const handleCreateRoom = async () => {
        if (!nickname.trim()) {
            setError('닉네임을 입력해주세요')
            return
        }

        setIsLoading(true)
        setError('')

        const result = await createMatch(nickname.trim(), 'battle', 'private')

        if (result) {
            localStorage.setItem(
                'player',
                JSON.stringify({
                    matchId: result.match.id,
                    playerId: result.player.id,
                    playerOrder: result.player.player_order,
                    nickname: nickname.trim(),
                })
            )
            router.push(`/game/${result.match.id}`)
        } else {
            setError('방 생성에 실패했습니다')
            setIsLoading(false)
        }
    }

    const handleJoinRoom = async () => {
        if (!nickname.trim()) {
            setError('닉네임을 입력해주세요')
            return
        }
        if (!roomCode.trim()) {
            setError('방 코드를 입력해주세요')
            return
        }

        setIsLoading(true)
        setError('')

        const result = await joinMatch(roomCode.trim(), nickname.trim())

        if (result) {
            localStorage.setItem(
                'player',
                JSON.stringify({
                    matchId: result.match.id,
                    playerId: result.player.id,
                    playerOrder: result.playerOrder,
                    nickname: nickname.trim(),
                })
            )
            router.push(`/game/${result.match.id}`)
        } else {
            setError('방에 참가할 수 없습니다. 코드를 확인해주세요.')
            setIsLoading(false)
        }
    }

    return (
        <div className='flex min-h-screen flex-col items-center justify-center bg-[#0f0f23] p-8'>
            <h1 className='mb-4 text-5xl font-bold text-white'>🥤 Soda Pop</h1>
            <p className='mb-8 text-gray-400'>Real-time 2P Puzzle Battle</p>

            <div className='w-full max-w-sm rounded-2xl bg-[#1a1a2e] p-6 shadow-2xl'>
                {mode === 'select' && (
                    <div className='flex flex-col gap-4'>
                        <input
                            type='text'
                            placeholder='닉네임 입력'
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className='w-full rounded-xl bg-[#252545] px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500'
                            maxLength={12}
                        />

                        <button
                            onClick={() => setMode('create')}
                            disabled={!nickname.trim()}
                            className='w-full rounded-xl bg-linear-to-r from-purple-500 to-pink-500 py-4 font-bold text-white transition-all hover:from-purple-600 hover:to-pink-600 disabled:opacity-50'>
                            방 만들기
                        </button>

                        <button
                            onClick={() => setMode('join')}
                            disabled={!nickname.trim()}
                            className='w-full rounded-xl border-2 border-purple-500 py-4 font-bold text-purple-400 transition-all hover:bg-purple-500/10 disabled:opacity-50'>
                            방 참가하기
                        </button>
                    </div>
                )}

                {mode === 'create' && (
                    <div className='flex flex-col gap-4'>
                        <p className='text-center text-gray-400'>
                            <span className='text-white'>{nickname}</span>
                            님으로 방을 만듭니다
                        </p>

                        <button
                            onClick={handleCreateRoom}
                            disabled={isLoading}
                            className='w-full rounded-xl bg-linear-to-r from-purple-500 to-pink-500 py-4 font-bold text-white transition-all hover:from-purple-600 hover:to-pink-600 disabled:opacity-50'>
                            {isLoading ? '생성 중...' : '방 생성하기'}
                        </button>

                        <button
                            onClick={() => setMode('select')}
                            disabled={isLoading}
                            className='text-gray-400 hover:text-white'>
                            ← 돌아가기
                        </button>
                    </div>
                )}

                {mode === 'join' && (
                    <div className='flex flex-col gap-4'>
                        <p className='text-center text-gray-400'>
                            방 코드를 입력해주세요
                        </p>

                        <input
                            type='text'
                            placeholder='방 코드 (6자리)'
                            value={roomCode}
                            onChange={(e) =>
                                setRoomCode(e.target.value.toUpperCase())
                            }
                            className='w-full rounded-xl bg-[#252545] px-4 py-3 text-center text-2xl font-bold tracking-widest text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500'
                            maxLength={6}
                        />

                        <button
                            onClick={handleJoinRoom}
                            disabled={isLoading || roomCode.length !== 6}
                            className='w-full rounded-xl bg-linear-to-r from-purple-500 to-pink-500 py-4 font-bold text-white transition-all hover:from-purple-600 hover:to-pink-600 disabled:opacity-50'>
                            {isLoading ? '참가 중...' : '참가하기'}
                        </button>

                        <button
                            onClick={() => setMode('select')}
                            disabled={isLoading}
                            className='text-gray-400 hover:text-white'>
                            ← 돌아가기
                        </button>
                    </div>
                )}

                {error && (
                    <p className='mt-4 text-center text-sm text-red-400'>
                        {error}
                    </p>
                )}
            </div>
        </div>
    )
}
