import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 브라우저용 Supabase 클라이언트
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

// Realtime 채널 구독용 클라이언트 (게임 방)
export function createGameChannel(roomId: string) {
  return supabase.channel(`room:${roomId}`, {
    config: {
      broadcast: {
        self: false, // 자신의 메시지는 수신 안함
      },
    },
  });
}
