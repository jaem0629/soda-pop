import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getActiveMatch, getAuthUser, getUserProfile } from './_lib/queries'
import { Lobby } from './lobby'

export default async function LobbyPage() {
    const supabase = await createSupabaseServerClient()
    const user = await getAuthUser(supabase)

    if (!user) {
        redirect('/')
    }

    // Run queries in parallel
    const [activeMatch, profile] = await Promise.all([
        getActiveMatch(supabase, user.id),
        getUserProfile(supabase, user.id),
    ])

    if (activeMatch) {
        redirect(`/game/${activeMatch.id}`)
    }

    const nickname = profile?.username ?? 'Guest'

    return <Lobby nickname={nickname} />
}
