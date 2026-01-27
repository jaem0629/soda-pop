import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// shadcn/ui용 클래스 병합 유틸리티
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// 6자리 방 코드 생성
export function generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 혼동되는 문자 제외 (0, O, 1, I)
    let code = ''
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)]
    }
    return code
}
