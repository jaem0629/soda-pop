'use client'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useEffect, useSyncExternalStore } from 'react'

type ConnectionState = {
    isDuplicate: boolean
    isChecking: boolean
}

const connectionStates = new Map<string, ConnectionState>()
const listeners = new Map<string, Set<() => void>>()

const DEFAULT_STATE: ConnectionState = {
    isDuplicate: false,
    isChecking: true,
}

function getConnectionState(key: string): ConnectionState {
    return connectionStates.get(key) ?? DEFAULT_STATE
}

function setConnectionState(key: string, state: ConnectionState) {
    connectionStates.set(key, state)
    listeners.get(key)?.forEach((listener) => listener())
}

function subscribe(key: string, callback: () => void) {
    if (!listeners.has(key)) {
        listeners.set(key, new Set())
    }
    listeners.get(key)!.add(callback)
    return () => {
        listeners.get(key)?.delete(callback)
    }
}

/**
 * Hook to prevent multiple connections to the same game room.
 * Uses Supabase Presence for cross-device/browser detection.
 */
export function useSingleConnection(roomId: string, userId: string) {
    const stateKey = `${roomId}:${userId}`
    const state = useSyncExternalStore(
        (callback) => subscribe(stateKey, callback),
        () => getConnectionState(stateKey),
        () => DEFAULT_STATE
    )

    useEffect(() => {
        const supabase = getSupabaseBrowserClient()
        const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
        const channelName = `presence:${roomId}`

        const channel = supabase.channel(channelName, {
            config: {
                presence: { key: userId },
            },
        })

        channel
            .on('presence', { event: 'sync' }, () => {
                const presenceState = channel.presenceState()
                const myPresences = presenceState[userId] as
                    | Array<{ session_id?: string; presence_ref: string }>
                    | undefined

                if (myPresences && myPresences.length > 1) {
                    // Check if there's another session that joined before this one
                    const otherSessions = myPresences.filter(
                        (p) => p.session_id && p.session_id !== sessionId
                    )
                    if (otherSessions.length > 0) {
                        setConnectionState(stateKey, {
                            isDuplicate: true,
                            isChecking: false,
                        })
                        return
                    }
                }

                setConnectionState(stateKey, {
                    isDuplicate: false,
                    isChecking: false,
                })
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        session_id: sessionId,
                        user_id: userId,
                        joined_at: Date.now(),
                    })
                }
            })

        return () => {
            channel.untrack()
            channel.unsubscribe()
            connectionStates.delete(stateKey)
        }
    }, [roomId, userId, stateKey])

    return state
}
