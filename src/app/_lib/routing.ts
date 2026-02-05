import type { MatchStatus } from '@/app/game/[roomId]/_lib/types'
import type { Route } from 'next'

/**
 * Get the appropriate route based on match status
 */
export function getMatchRoute(matchId: string, status: MatchStatus): Route {
  switch (status) {
    case 'playing':
      return `/game/${matchId}/play` as Route
    case 'finished':
      return `/game/${matchId}/result` as Route
    case 'waiting':
    case 'matching':
    default:
      return `/game/${matchId}/waiting` as Route
  }
}
