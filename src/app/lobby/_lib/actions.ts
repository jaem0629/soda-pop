'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createRoom(
    playerName: string
): Promise<{ success: boolean; matchId?: string; error?: string }> {
    const supabase = await createSupabaseServerClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Authentication required' }
    }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const randomValues = crypto.getRandomValues(new Uint8Array(6))
    const code = Array.from(randomValues, (v) => chars[v % chars.length]).join(
        ''
    )

    const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
            mode: 'battle',
            entry_type: 'private',
            code,
            max_players: 2,
            status: 'waiting',
        })
        .select()
        .single()

    if (matchError || !match) {
        console.error('Match creation failed:', matchError)
        return { success: false, error: 'Failed to create room' }
    }

    const { error: playerError } = await supabase.from('match_players').insert({
        match_id: match.id,
        user_id: user.id,
        player_name: playerName,
        player_order: 1,
        is_host: true,
    })

    if (playerError) {
        console.error('Player addition failed:', playerError)
        await supabase
            .from('matches')
            .update({ status: 'abandoned' })
            .eq('id', match.id)
        return { success: false, error: 'Failed to create room' }
    }

    return { success: true, matchId: match.id }
}

export async function joinRoom(
    code: string,
    playerName: string
): Promise<{ success: boolean; matchId?: string; error?: string }> {
    const supabase = await createSupabaseServerClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Authentication required' }
    }

    const { data: match, error: matchError } = await supabase
        .from('matches')
        .select()
        .eq('code', code.toUpperCase())
        .single()

    if (matchError || !match) {
        return { success: false, error: 'Room not found' }
    }

    if (match.status === 'finished' || match.status === 'abandoned') {
        return { success: false, error: 'Game already ended' }
    }

    const { data: existingPlayers, error: playersError } = await supabase
        .from('match_players')
        .select()
        .eq('match_id', match.id)
        .order('player_order', { ascending: true })

    if (playersError) {
        return { success: false, error: 'Error occurred' }
    }

    const players = existingPlayers ?? []

    // Rejoin if already in the match
    const existingPlayer = players.find((p) => p.user_id === user.id)
    if (existingPlayer) {
        return { success: true, matchId: match.id }
    }

    if (match.status === 'playing') {
        return { success: false, error: 'Game already in progress' }
    }

    if (players.length >= match.max_players) {
        return { success: false, error: 'Room is full' }
    }

    const nextOrder = players.length + 1
    const { error: insertError } = await supabase.from('match_players').insert({
        match_id: match.id,
        user_id: user.id,
        player_name: playerName,
        player_order: nextOrder,
        is_host: false,
    })

    if (insertError) {
        console.error('Player addition failed:', insertError)
        return { success: false, error: 'Failed to join room' }
    }

    return { success: true, matchId: match.id }
}

export async function getAuthUserId(): Promise<string | null> {
    const supabase = await createSupabaseServerClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    return user?.id ?? null
}

export async function signOut(): Promise<void> {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()
    redirect('/')
}
