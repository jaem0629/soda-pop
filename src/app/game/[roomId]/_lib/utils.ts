import type { MatchPlayer } from './types'
import { GAME_DURATION } from './types'

export function calculateTimeLeft(
    startedAt: string | null,
    duration: number = GAME_DURATION
): number {
    if (!startedAt) return duration

    const startTime = new Date(startedAt).getTime()

    if (isNaN(startTime)) {
        console.error('Invalid startedAt timestamp:', startedAt)
        return duration
    }

    const now = Date.now()
    const elapsed = Math.floor((now - startTime) / 1000)
    const remaining = duration - elapsed

    return Math.max(0, remaining)
}

export function getPlayerByOrder(
    players: MatchPlayer[],
    order: number
): MatchPlayer | undefined {
    return players.find((p) => p.player_order === order)
}

export function getOpponent(
    players: MatchPlayer[],
    myOrder: number
): MatchPlayer | undefined {
    return players.find((p) => p.player_order !== myOrder)
}

export function findPlayerByUserId(
    players: MatchPlayer[],
    userId: string
): MatchPlayer | undefined {
    return players.find((p) => p.user_id === userId)
}
