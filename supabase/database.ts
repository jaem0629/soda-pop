export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      match_players: {
        Row: {
          id: string
          is_host: boolean | null
          joined_at: string | null
          match_id: string
          player_name: string
          player_order: number
          score: number | null
          team_number: number | null
          user_id: string | null
        }
        Insert: {
          id?: string
          is_host?: boolean | null
          joined_at?: string | null
          match_id: string
          player_name: string
          player_order: number
          score?: number | null
          team_number?: number | null
          user_id?: string | null
        }
        Update: {
          id?: string
          is_host?: boolean | null
          joined_at?: string | null
          match_id?: string
          player_name?: string
          player_order?: number
          score?: number | null
          team_number?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_players_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_players_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          code: string | null
          created_at: string | null
          entry_type: Database["public"]["Enums"]["entry_type"]
          expired_at: string | null
          finished_at: string | null
          id: string
          max_players: number
          mode: Database["public"]["Enums"]["game_mode"]
          settings: Json | null
          started_at: string | null
          status: Database["public"]["Enums"]["match_status"] | null
          team_size: number | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          entry_type: Database["public"]["Enums"]["entry_type"]
          expired_at?: string | null
          finished_at?: string | null
          id?: string
          max_players?: number
          mode: Database["public"]["Enums"]["game_mode"]
          settings?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["match_status"] | null
          team_size?: number | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          entry_type?: Database["public"]["Enums"]["entry_type"]
          expired_at?: string | null
          finished_at?: string | null
          id?: string
          max_players?: number
          mode?: Database["public"]["Enums"]["game_mode"]
          settings?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["match_status"] | null
          team_size?: number | null
        }
        Relationships: []
      }
      matchmaking_queue: {
        Row: {
          id: string
          matched_at: string | null
          matched_match_id: string | null
          mode: Database["public"]["Enums"]["game_mode"]
          player_name: string
          queued_at: string | null
          status: Database["public"]["Enums"]["queue_status"] | null
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          matched_at?: string | null
          matched_match_id?: string | null
          mode: Database["public"]["Enums"]["game_mode"]
          player_name: string
          queued_at?: string | null
          status?: Database["public"]["Enums"]["queue_status"] | null
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          matched_at?: string | null
          matched_match_id?: string | null
          mode?: Database["public"]["Enums"]["game_mode"]
          player_name?: string
          queued_at?: string | null
          status?: Database["public"]["Enums"]["queue_status"] | null
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matchmaking_queue_matched_match_id_fkey"
            columns: ["matched_match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matchmaking_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rankings: {
        Row: {
          created_at: string | null
          id: string
          is_winner: boolean | null
          match_id: string | null
          mode: Database["public"]["Enums"]["game_mode"]
          player_names: string[]
          score: number
          user_ids: string[]
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_winner?: boolean | null
          match_id?: string | null
          mode: Database["public"]["Enums"]["game_mode"]
          player_names: string[]
          score: number
          user_ids: string[]
        }
        Update: {
          created_at?: string | null
          id?: string
          is_winner?: boolean | null
          match_id?: string | null
          mode?: Database["public"]["Enums"]["game_mode"]
          player_names?: string[]
          score?: number
          user_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "rankings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms_backup: {
        Row: {
          code: string
          created_at: string | null
          expired_at: string | null
          id: string
          player1_name: string | null
          player1_score: number | null
          player2_name: string | null
          player2_score: number | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          expired_at?: string | null
          id?: string
          player1_name?: string | null
          player1_score?: number | null
          player2_name?: string | null
          player2_score?: number | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          expired_at?: string | null
          id?: string
          player1_name?: string | null
          player1_score?: number | null
          player2_name?: string | null
          player2_score?: number | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          id: string
          username: string
        }
        Insert: {
          created_at?: string | null
          id: string
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_matches: { Args: never; Returns: undefined }
      cleanup_old_rooms: { Args: never; Returns: undefined }
    }
    Enums: {
      entry_type: "private" | "matchmaking"
      game_mode: "solo" | "battle" | "coop" | "custom"
      match_status:
        | "waiting"
        | "matching"
        | "playing"
        | "finished"
        | "abandoned"
      queue_status: "waiting" | "matched" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      entry_type: ["private", "matchmaking"],
      game_mode: ["solo", "battle", "coop", "custom"],
      match_status: ["waiting", "matching", "playing", "finished", "abandoned"],
      queue_status: ["waiting", "matched", "cancelled"],
    },
  },
} as const
