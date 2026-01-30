'use client'

import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react'

export type GameEvent =
    | { type: 'player_joined'; playerName: string }
    | { type: 'game_start' }
    | { type: 'score_update'; playerNumber: number; score: number }
    | { type: 'game_end' }

type RealtimeContextType = {
    isConnected: boolean
    sendScore: (score: number) => void
    sendGameStart: () => void
    sendGameEnd: () => void
    sendPlayerJoined: (playerName: string) => void
    subscribe: (callback: (event: GameEvent) => void) => () => void
}

const RealtimeContext = createContext<RealtimeContextType | null>(null)

export function useRealtimeContext() {
    const context = useContext(RealtimeContext)
    if (!context) {
        throw new Error(
            'useRealtimeContext must be used within RealtimeProvider'
        )
    }
    return context
}

interface RealtimeProviderProps {
    children: ReactNode
    roomId: string
    playerNumber: number
}

export function RealtimeProvider({
    children,
    roomId,
    playerNumber,
}: RealtimeProviderProps) {
    const [isConnected, setIsConnected] = useState(false)
    const channelRef = useRef<RealtimeChannel | null>(null)
    const subscribersRef = useRef<Set<(event: GameEvent) => void>>(new Set())

    // Setup channel
    useEffect(() => {
        const channel = supabase.channel(`room:${roomId}`, {
            config: {
                broadcast: { self: false },
            },
        })

        channel
            .on('broadcast', { event: 'game_event' }, ({ payload }) => {
                const event = payload as GameEvent
                subscribersRef.current.forEach((callback) => callback(event))
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
            setIsConnected(false)
        }
    }, [roomId])

    // Broadcast helper
    const broadcast = (event: GameEvent) => {
        channelRef.current?.send({
            type: 'broadcast',
            event: 'game_event',
            payload: event,
        })
    }

    const sendScore = (score: number) => {
        broadcast({ type: 'score_update', playerNumber, score })
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

    const subscribe = (callback: (event: GameEvent) => void) => {
        subscribersRef.current.add(callback)
        return () => {
            subscribersRef.current.delete(callback)
        }
    }

    const value: RealtimeContextType = {
        isConnected,
        sendScore,
        sendGameStart,
        sendGameEnd,
        sendPlayerJoined,
        subscribe,
    }

    return (
        <RealtimeContext.Provider value={value}>
            {children}
        </RealtimeContext.Provider>
    )
}
