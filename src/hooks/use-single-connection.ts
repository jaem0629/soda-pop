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

const SESSION_STORAGE_KEY = 'game-tab-session-id'

/**
 * Get or create a tab-specific session ID.
 * This persists across refreshes but is unique per tab.
 */
function getTabSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY)
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId)
  }
  return sessionId
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
 * Hook to prevent multiple game connections for the same user.
 * Uses Supabase Presence for cross-device/browser detection.
 * Uses sessionStorage to allow same-tab refreshes.
 */
export function useSingleConnection(userId: string) {
  const state = useSyncExternalStore(
    (callback) => subscribe(userId, callback),
    () => getConnectionState(userId),
    () => DEFAULT_STATE,
  )

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    const tabSessionId = getTabSessionId()

    const channel = supabase.channel('presence:game', {
      config: {
        presence: { key: userId },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState()
        const myPresences = presenceState[userId] as
          | Array<{ tab_session_id?: string; presence_ref: string }>
          | undefined

        if (myPresences && myPresences.length > 1) {
          // Check if there's another TAB (not just another presence entry)
          const otherTabs = myPresences.filter(
            (p) => p.tab_session_id && p.tab_session_id !== tabSessionId,
          )
          if (otherTabs.length > 0) {
            setConnectionState(userId, {
              isDuplicate: true,
              isChecking: false,
            })
            return
          }
        }

        setConnectionState(userId, {
          isDuplicate: false,
          isChecking: false,
        })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            tab_session_id: tabSessionId,
            user_id: userId,
            joined_at: Date.now(),
          })
        }
      })

    return () => {
      channel.untrack()
      channel.unsubscribe()
      connectionStates.delete(userId)
    }
  }, [userId])

  return state
}
