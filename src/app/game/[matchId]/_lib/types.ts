import type { Database } from '@/../supabase/database'

type Tables = Database['public']['Tables']
type Enums = Database['public']['Enums']

export type GameMode = Enums['game_mode']
export type EntryType = Enums['entry_type']
export type MatchStatus = Enums['match_status']

export type Match = Tables['matches']['Row']
export type MatchInsert = Tables['matches']['Insert']
export type MatchPlayer = Tables['match_players']['Row']
export type MatchPlayerInsert = Tables['match_players']['Insert']

export type MatchWithPlayers = Match & {
  players: MatchPlayer[]
}
