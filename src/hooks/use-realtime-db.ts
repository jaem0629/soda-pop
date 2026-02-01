'use client'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

interface UseRealtimeDBOptions {
    table: string
    filter?: string
    onUpdate?: () => void
}

/**
 * DB 테이블의 변경사항을 실시간으로 감지하는 훅
 *
 * @example
 * // match_players 테이블 감지
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
                () => {
                    onUpdate?.()
                }
            )
            .subscribe((status) => {
                setIsSubscribed(status === 'SUBSCRIBED')
            })

        return () => {
            channel.unsubscribe()
            setIsSubscribed(false)
        }
    }, [table, filter, onUpdate])

    return { isSubscribed }
}
