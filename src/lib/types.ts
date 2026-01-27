// Supabase Database 타입 정의
export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          code: string;
          player1_name: string | null;
          player2_name: string | null;
          player1_score: number;
          player2_score: number;
          status: RoomStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          player1_name?: string | null;
          player2_name?: string | null;
          player1_score?: number;
          player2_score?: number;
          status?: RoomStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          player1_name?: string | null;
          player2_name?: string | null;
          player1_score?: number;
          player2_score?: number;
          status?: RoomStatus;
          created_at?: string;
        };
      };
    };
  };
};

// 방 상태
export type RoomStatus = "waiting" | "playing" | "finished";

// 게임 방 타입
export type Room = Database["public"]["Tables"]["rooms"]["Row"];

// 퍼즐 조각 타입
export type PieceType = 0 | 1 | 2 | 3 | 4 | 5;

// 퍼즐 보드 (8x8 그리드)
export type Board = PieceType[][];

// 좌표
export type Position = {
  row: number;
  col: number;
};

// 게임 상태
export type GameState = {
  board: Board;
  score: number;
  combo: number;
  isAnimating: boolean;
};

// Realtime 메시지 타입
export type ScoreUpdatePayload = {
  playerId: string;
  score: number;
};

export type GameEventPayload =
  | { type: "score_update"; playerId: string; score: number }
  | { type: "game_start" }
  | { type: "game_end" };
