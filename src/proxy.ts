import { updateSession } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * 다음 경로 제외:
         * - _next/static (정적 파일)
         * - _next/image (이미지 최적화)
         * - favicon.ico (파비콘)
         * - 이미지 파일들
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
