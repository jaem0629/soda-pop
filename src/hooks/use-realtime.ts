'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

type GameEvent =
    | { type: 'player_joined'; playerName: string }
    | { type: 'game_start' }
    | { type: 'score_update'; playerNumber: 1 | 2; score: number }
    | { type: 'game_end' }

type UseRealtimeProps = {
    roomId: string
    playerNumber: 1 | 2
    onEvent: (event: GameEvent) => void
}

export function useRealtime({
    roomId,
    playerNumber,
    onEvent,
}: UseRealtimeProps) {
    const [isConnected, setIsConnected] = useState(false)
    const channelRef = useRef<RealtimeChannel | null>(null)

    useEffect(() => {
        const channel = supabase.channel(`room:${roomId}`, {
            config: {
                broadcast: {
                    self: false,
                },
            },
        })

        channel
            .on('broadcast', { event: 'game_event' }, ({ payload }) => {
                onEvent(payload as GameEvent)
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setIsConnected(true)
                }
            })

        channelRef.current = channel

        return () => {
            channel.unsubscribe()
            channelRef.current = null
        }
    }, [roomId, onEvent])

    // 이벤트 브로드캐스트
    const broadcast = useCallback((event: GameEvent) => {
        if (!channelRef.current) return

        channelRef.current.send({
            type: 'broadcast',
            event: 'game_event',
            payload: event,
        })
    }, [])

    // 점수 전송
    const sendScore = useCallback(
        (score: number) => {
            broadcast({
                type: 'score_update',
                playerNumber,
                score,
            })
        },
        [broadcast, playerNumber]
    )

    // 게임 시작 알림
    const sendGameStart = useCallback(() => {
        broadcast({ type: 'game_start' })
    }, [broadcast])

    // 게임 종료 알림
    const sendGameEnd = useCallback(() => {
        broadcast({ type: 'game_end' })
    }, [broadcast])

    // 플레이어 참가 알림
    const sendPlayerJoined = useCallback(
        (playerName: string) => {
            broadcast({ type: 'player_joined', playerName })
        },
        [broadcast]
    )

    return {
        isConnected,
        sendScore,
        sendGameStart,
        sendGameEnd,
        sendPlayerJoined,
    }
}
