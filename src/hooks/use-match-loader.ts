'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    getMatch,
    getOpponent,
    calculateTimeLeft,
    GAME_DURATION,
    type MatchWithPlayers,
    type MatchPlayer,
} from '@/lib/match'

type UseMatchLoaderProps = {
    matchId: string
    playerOrder: number
    pollInterval?: number
}

type UseMatchLoaderReturn = {
    match: MatchWithPlayers | null
    myPlayer: MatchPlayer | undefined
    opponent: MatchPlayer | undefined
    isLoading: boolean
    setMatch: React.Dispatch<React.SetStateAction<MatchWithPlayers | null>>
    reload: () => void
}

export function useMatchLoader({
    matchId,
    playerOrder,
    pollInterval = 2000,
}: UseMatchLoaderProps): UseMatchLoaderReturn {
    const router = useRouter()
    const [match, setMatch] = useState<MatchWithPlayers | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // 파생 데이터
    const myPlayer = match?.players.find((p) => p.player_order === playerOrder)
    const opponent = match ? getOpponent(match.players, playerOrder) : undefined

    // 매치 로드 함수 (useCallback으로 안정화)
    const reload = useCallback(() => {
        getMatch(matchId).then((matchData) => {
            if (!matchData) {
                router.push('/')
                return
            }
            setMatch(matchData)
            setIsLoading(false)
        })
    }, [matchId, router])

    // 초기 로드
    useEffect(() => {
        if (!matchId) return
        reload()
    }, [matchId, reload])

    // 대기 중일 때 폴링
    useEffect(() => {
        if (match?.status !== 'waiting') return

        const interval = setInterval(reload, pollInterval)
        return () => clearInterval(interval)
    }, [match?.status, pollInterval, reload])

    return {
        match,
        myPlayer,
        opponent,
        isLoading,
        setMatch,
        reload,
    }
}

// 복원 데이터 계산 (순수 함수)
export function getRestoredGameState(
    match: MatchWithPlayers | null,
    playerOrder: number
) {
    if (!match || match.status !== 'playing') {
        return { myScore: 0, opponentScore: 0, elapsedSeconds: 0 }
    }

    const myPlayer = match.players.find((p) => p.player_order === playerOrder)
    const opponent = getOpponent(match.players, playerOrder)

    const myScore = myPlayer?.score ?? 0
    const opponentScore = opponent?.score ?? 0

    let elapsedSeconds = 0
    if (match.started_at) {
        const remaining = calculateTimeLeft(match.started_at)
        elapsedSeconds = GAME_DURATION - remaining
    }

    return { myScore, opponentScore, elapsedSeconds }
}
