import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Lobby } from './lobby'

export const runtime = 'edge'

export default async function LobbyPage() {
    const supabase = await createSupabaseServerClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    // Run queries in parallel
    const [{ data: activeMatch }, { data: profile }] = await Promise.all([
        supabase
            .from('matches')
            .select('id, status, match_players!inner(user_id)')
            .eq('match_players.user_id', user.id)
            .in('status', ['waiting', 'playing'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        supabase.from('users').select('username').eq('id', user.id).single(),
    ])

    if (activeMatch) {
        redirect(`/game/${activeMatch.id}`)
    }

    const nickname = profile?.username ?? 'Guest'

    return <Lobby nickname={nickname} />
}
