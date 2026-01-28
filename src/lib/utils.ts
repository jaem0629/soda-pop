import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const randomValues = crypto.getRandomValues(new Uint8Array(6))
    return Array.from(randomValues, (v) => chars[v % chars.length]).join('')
}
