import type { GameMode } from '@/app/game/[roomId]/_lib/types'

export type ScoreType = 'individual' | 'team' | 'none'

export interface GameModeConfig {
    mode: GameMode
    maxPlayers: number
    hasOpponents: boolean
    hasTeammates: boolean
    timerEnabled: boolean
    scoreType: ScoreType
    teamSize: number | null
}

export const GAME_MODE_CONFIGS: Record<GameMode, GameModeConfig> = {
    solo: {
        mode: 'solo',
        maxPlayers: 1,
        hasOpponents: false,
        hasTeammates: false,
        timerEnabled: true,
        scoreType: 'individual',
        teamSize: null,
    },
    battle: {
        mode: 'battle',
        maxPlayers: 2,
        hasOpponents: true,
        hasTeammates: false,
        timerEnabled: true,
        scoreType: 'individual',
        teamSize: null,
    },
    coop: {
        mode: 'coop',
        maxPlayers: 4,
        hasOpponents: false,
        hasTeammates: true,
        timerEnabled: true,
        scoreType: 'team',
        teamSize: 2,
    },
    custom: {
        mode: 'custom',
        maxPlayers: 8,
        hasOpponents: true,
        hasTeammates: true,
        timerEnabled: true,
        scoreType: 'team',
        teamSize: 4,
    },
}

export function getGameModeConfig(mode: GameMode): GameModeConfig {
    return GAME_MODE_CONFIGS[mode]
}
