'use client'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Home } from './home'

export default function HomePage() {
    const router = useRouter()

    useEffect(() => {
        // Run auth check in background, don't block rendering
        const checkAuth = async () => {
            const supabase = createSupabaseBrowserClient()
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (user) {
                const { data: activeMatch } = await supabase
                    .from('matches')
                    .select('id, status, match_players!inner(user_id)')
                    .eq('match_players.user_id', user.id)
                    .in('status', ['waiting', 'playing'])
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle()

                if (activeMatch) {
                    router.push(`/game/${activeMatch.id}`)
                    return
                }

                router.push('/lobby')
            }
        }

        checkAuth()
    }, [router])

    // Always show content immediately for better LCP
    return <Home />
}
