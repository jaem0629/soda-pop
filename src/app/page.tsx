'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
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
        <div className='flex min-h-svh flex-col items-center justify-center p-4'>
            <div className='mb-8 text-center'>
                <h1 className='mb-2 text-5xl font-bold tracking-tight'>
                    🥤 Soda Pop
                </h1>
                <p className='text-muted-foreground'>
                    Real-time 2P Puzzle Battle
                </p>
            </div>

            <Card className='w-full max-w-sm'>
                {mode === 'select' && (
                    <>
                        <CardHeader>
                            <CardTitle>게임 시작</CardTitle>
                            <CardDescription>
                                닉네임을 입력하고 방을 만들거나 참가하세요
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='flex flex-col gap-4'>
                            <Input
                                type='text'
                                placeholder='닉네임 입력'
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                maxLength={12}
                            />
                            <Button
                                onClick={() => setMode('create')}
                                disabled={!nickname.trim()}
                                className='w-full'
                                size='lg'>
                                방 만들기
                            </Button>
                            <Button
                                onClick={() => setMode('join')}
                                disabled={!nickname.trim()}
                                variant='outline'
                                className='w-full'
                                size='lg'>
                                방 참가하기
                            </Button>
                        </CardContent>
                    </>
                )}

                {mode === 'create' && (
                    <>
                        <CardHeader>
                            <CardTitle>방 만들기</CardTitle>
                            <CardDescription>
                                <span className='text-foreground font-medium'>
                                    {nickname}
                                </span>
                                님으로 방을 만듭니다
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='flex flex-col gap-4'>
                            <Button
                                onClick={handleCreateRoom}
                                disabled={isLoading}
                                className='w-full'
                                size='lg'>
                                {isLoading ? '생성 중...' : '방 생성하기'}
                            </Button>
                            <Button
                                onClick={() => setMode('select')}
                                disabled={isLoading}
                                variant='ghost'
                                className='w-full'>
                                ← 돌아가기
                            </Button>
                        </CardContent>
                    </>
                )}

                {mode === 'join' && (
                    <>
                        <CardHeader>
                            <CardTitle>방 참가하기</CardTitle>
                            <CardDescription>
                                방 코드를 입력해주세요
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='flex flex-col gap-4'>
                            <Input
                                type='text'
                                placeholder='방 코드 (6자리)'
                                value={roomCode}
                                onChange={(e) =>
                                    setRoomCode(e.target.value.toUpperCase())
                                }
                                className='text-center text-2xl font-bold tracking-widest'
                                maxLength={6}
                            />
                            <Button
                                onClick={handleJoinRoom}
                                disabled={isLoading || roomCode.length !== 6}
                                className='w-full'
                                size='lg'>
                                {isLoading ? '참가 중...' : '참가하기'}
                            </Button>
                            <Button
                                onClick={() => setMode('select')}
                                disabled={isLoading}
                                variant='ghost'
                                className='w-full'>
                                ← 돌아가기
                            </Button>
                        </CardContent>
                    </>
                )}

                {error && (
                    <CardContent className='pt-0'>
                        <p className='text-destructive text-center text-sm'>
                            {error}
                        </p>
                    </CardContent>
                )}
            </Card>
        </div>
    )
}
