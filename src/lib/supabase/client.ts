'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/../supabase/database'

export function createSupabaseBrowserClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

// 싱글톤 인스턴스 (클라이언트 컴포넌트에서 재사용)
let browserClient: ReturnType<typeof createSupabaseBrowserClient> | null = null

export function getSupabaseBrowserClient() {
    if (!browserClient) {
        browserClient = createSupabaseBrowserClient()
    }
    return browserClient
}
