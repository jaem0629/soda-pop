'use client'

import { useEffect, useEffectEvent, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

type GameEvent =
    | { type: 'player_joined'; playerName: string }
    | { type: 'game_start' }
    | { type: 'score_update'; playerNumber: number; score: number }
    | { type: 'game_end' }

type UseRealtimeProps = {
    roomId: string
    playerNumber: number
    onEvent: (event: GameEvent) => void
}

export function useRealtime({
    roomId,
    playerNumber,
    onEvent,
}: UseRealtimeProps) {
    const [isConnected, setIsConnected] = useState(false)
    const channelRef = useRef<RealtimeChannel | null>(null)

    const handleEvent = useEffectEvent((event: GameEvent) => {
        onEvent(event)
    })

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
                handleEvent(payload as GameEvent)
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
    }, [roomId])

    const broadcast = (event: GameEvent) => {
        if (!channelRef.current) return

        channelRef.current.send({
            type: 'broadcast',
            event: 'game_event',
            payload: event,
        })
    }

    const sendScore = (score: number) => {
        broadcast({
            type: 'score_update',
            playerNumber,
            score,
        })
    }

    const sendGameStart = () => {
        broadcast({ type: 'game_start' })
    }

    const sendGameEnd = () => {
        broadcast({ type: 'game_end' })
    }

    const sendPlayerJoined = (playerName: string) => {
        broadcast({ type: 'player_joined', playerName })
    }

    return {
        isConnected,
        sendScore,
        sendGameStart,
        sendGameEnd,
        sendPlayerJoined,
    }
}
