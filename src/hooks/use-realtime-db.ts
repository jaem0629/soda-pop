'use client'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Database } from '@/../supabase/database'
import { useEffect, useEffectEvent, useState } from 'react'

type TableName = keyof Database['public']['Tables']

interface UseRealtimeDBOptions {
    table: TableName
    filter?: string
    onUpdate?: () => void
}

/**
 * Hook to listen for realtime database changes
 *
 * @example
 * useRealtimeDB({
 *   table: 'match_players',
 *   filter: `match_id=eq.${matchId}`,
 *   onUpdate: reloadMatch
 * })
 */
export function useRealtimeDB({
    table,
    filter,
    onUpdate,
}: UseRealtimeDBOptions) {
    const [isSubscribed, setIsSubscribed] = useState(false)

    const handleUpdate = useEffectEvent(() => {
        onUpdate?.()
    })

    useEffect(() => {
        const supabase = getSupabaseBrowserClient()
        const channelName = filter ? `db:${table}:${filter}` : `db:${table}`

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table,
                    ...(filter && { filter }),
                },
                handleUpdate
            )
            .subscribe((status) => {
                setIsSubscribed(status === 'SUBSCRIBED')
            })

        return () => {
            channel.unsubscribe()
            setIsSubscribed(false)
        }
    }, [table, filter])

    return { isSubscribed }
}
