import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Home } from './home'

export default async function HomePage() {
    const supabase = await createSupabaseServerClient()
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
            redirect(`/game/${activeMatch.id}`)
        }

        redirect('/lobby')
    }

    return <Home />
}
