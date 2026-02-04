import type { Position, PieceType, DropInfo } from './game-logic'

export const ANIMATION_DURATION = {
    swap: 200,
    match: 350,
    drop: 400,
} as const

export const easing = {
    outBounce: (t: number): number => {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t
        } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
        } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
        } else {
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
        }
    },

    outQuad: (t: number): number => {
        return 1 - (1 - t) * (1 - t)
    },

    inOutQuad: (t: number): number => {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    },
}

export type AnimationState =
    | { type: 'none' }
    | { type: 'swap'; progress: number; pos1: Position; pos2: Position }
    | {
          type: 'match-and-drop'
          phase: 'match' | 'drop'
          progress: number
          matches: Position[][]
          drops: DropInfo[]
          baseBoard: (PieceType | null)[][]
      }
