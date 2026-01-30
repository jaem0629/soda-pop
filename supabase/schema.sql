-- ================================================
-- SODA-POP Database Schema
-- 확장된 게임 모드 지원
-- ================================================

-- ================================================
-- 게임 모드 정의
-- ================================================
-- 
-- | 모드    | 인원  | 참여 방식              |
-- |---------|-------|------------------------|
-- | solo    | 1     | 바로 시작              |
-- | battle  | 2     | private / matchmaking  |
-- | coop    | 4     | private / matchmaking  |
-- | custom  | 2~8   | private only           |
--
-- ================================================

-- ================================================
-- 1. USERS 테이블
-- Supabase Auth와 연동
-- ================================================

-- TODO: Supabase Auth 설정 후 활성화
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스: 유저네임 검색
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- ================================================
-- 2. MATCHES 테이블
-- ================================================

-- 게임 모드 enum
DO $$
BEGIN
  CREATE TYPE game_mode AS ENUM ('solo', 'battle', 'coop', 'custom');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 참여 방식 enum
DO $$
BEGIN
  CREATE TYPE entry_type AS ENUM ('private', 'matchmaking');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 매치 상태 enum
DO $$
BEGIN
  CREATE TYPE match_status AS ENUM ('waiting', 'matching', 'playing', 'finished', 'abandoned');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 게임 설정
  mode game_mode NOT NULL,
  entry_type entry_type NOT NULL,
  code VARCHAR(6) UNIQUE,  -- private 전용, matchmaking은 NULL
  
  -- 인원 설정
  max_players INT NOT NULL DEFAULT 2,
  team_size INT,  -- coop: 2, 나머지: NULL
  
  -- 상태
  status match_status NOT NULL DEFAULT 'waiting',
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ DEFAULT NULL
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_matches_code ON public.matches(code) WHERE code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status) WHERE expired_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_matches_mode_status ON public.matches(mode, status) WHERE expired_at IS NULL;

-- ================================================
-- 3. MATCH_PLAYERS 테이블 (N:M 관계)
-- ================================================

CREATE TABLE IF NOT EXISTS public.match_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  
  -- 플레이어 정보
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,  -- 익명은 NULL
  player_name VARCHAR(20) NOT NULL,  -- 표시 이름
  
  -- 게임 내 정보
  player_order INT NOT NULL,  -- 입장 순서 (1, 2, 3...)
  team_number INT,  -- coop: 1 또는 2, 나머지: NULL
  score INT NOT NULL DEFAULT 0,
  
  -- 역할
  is_host BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- 타임스탬프
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(match_id, player_order)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_match_players_match ON public.match_players(match_id);
CREATE INDEX IF NOT EXISTS idx_match_players_user ON public.match_players(user_id) WHERE user_id IS NOT NULL;

-- ================================================
-- 4. MATCHMAKING_QUEUE 테이블
-- ================================================

-- 매칭 큐 상태 enum
DO $$
BEGIN
  CREATE TYPE queue_status AS ENUM ('waiting', 'matched', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.matchmaking_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 플레이어/팀 정보
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  player_name VARCHAR(20) NOT NULL,  -- 익명용
  
  -- 매칭 설정
  mode game_mode NOT NULL,  -- battle 또는 coop
  team_id UUID,  -- coop private: 팀 식별자 (같은 team_id끼리 한 팀)
  
  -- 상태
  status queue_status DEFAULT 'waiting',
  matched_match_id UUID REFERENCES public.matches(id),
  
  -- 타임스탬프
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  matched_at TIMESTAMPTZ
);

-- 인덱스: 대기 중인 플레이어 찾기
CREATE INDEX IF NOT EXISTS idx_queue_waiting ON public.matchmaking_queue(mode, status, queued_at) 
  WHERE status = 'waiting';

-- ================================================
-- 5. RANKINGS 테이블
-- ================================================

CREATE TABLE IF NOT EXISTS public.rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 게임 정보
  mode game_mode NOT NULL,
  match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  
  -- 플레이어 정보 (협동은 복수)
  user_ids UUID[] NOT NULL,
  player_names VARCHAR(20)[] NOT NULL,  -- 표시용
  
  -- 결과
  score INT NOT NULL,
  is_winner BOOLEAN DEFAULT FALSE,  -- battle/coop에서 승리 여부
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스: 모드별 랭킹 조회
CREATE INDEX IF NOT EXISTS idx_rankings_mode_score ON public.rankings(mode, score DESC);
CREATE INDEX IF NOT EXISTS idx_rankings_user ON public.rankings USING GIN(user_ids);

-- ================================================
-- 6. RLS 정책
-- ================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

-- TODO: 상세 RLS 정책 정의
-- 현재는 개발용으로 열어둠

-- users: 본인 정보만 수정 가능
CREATE POLICY "users_select" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_insert" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update" ON public.users FOR UPDATE USING (auth.uid() = id);

-- matches: 활성 매치 조회, 생성/수정 가능
CREATE POLICY "matches_select" ON public.matches FOR SELECT USING (expired_at IS NULL);
CREATE POLICY "matches_insert" ON public.matches FOR INSERT WITH CHECK (true);
CREATE POLICY "matches_update" ON public.matches FOR UPDATE USING (expired_at IS NULL);

-- match_players: 조회/생성 자유, 수정은 본인만
CREATE POLICY "match_players_select" ON public.match_players FOR SELECT USING (true);
CREATE POLICY "match_players_insert" ON public.match_players FOR INSERT WITH CHECK (true);
CREATE POLICY "match_players_update" ON public.match_players FOR UPDATE USING (auth.uid() = user_id);

-- matchmaking_queue: 본인 큐만 관리
-- TODO: auth.uid() 체크 추가
CREATE POLICY "queue_select" ON public.matchmaking_queue FOR SELECT USING (true);
CREATE POLICY "queue_insert" ON public.matchmaking_queue FOR INSERT WITH CHECK (true);
CREATE POLICY "queue_update" ON public.matchmaking_queue FOR UPDATE USING (true);
CREATE POLICY "queue_delete" ON public.matchmaking_queue FOR DELETE USING (true);

-- rankings: 조회만 가능, 삽입은 서버(service_role)에서만
CREATE POLICY "rankings_select" ON public.rankings FOR SELECT USING (true);
CREATE POLICY "rankings_insert" ON public.rankings FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ================================================
-- 7. 함수
-- ================================================

-- Cleanup 함수
CREATE OR REPLACE FUNCTION cleanup_old_matches()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 게임 시작 후 10분 지난 매치 만료
  UPDATE matches 
  SET expired_at = NOW(),
      status = CASE 
        WHEN status = 'playing' THEN 'abandoned'
        ELSE status 
      END
  WHERE expired_at IS NULL
    AND started_at IS NOT NULL 
    AND started_at < NOW() - INTERVAL '10 minutes';
  
  -- 대기 중 30분 지난 매치 만료
  UPDATE matches 
  SET expired_at = NOW()
  WHERE expired_at IS NULL
    AND started_at IS NULL 
    AND created_at < NOW() - INTERVAL '30 minutes';
  
  -- 10분 이상 대기 중인 큐 취소
  UPDATE matchmaking_queue
  SET status = 'cancelled'
  WHERE status = 'waiting'
    AND queued_at < NOW() - INTERVAL '10 minutes';
END;
$$;

-- TODO: 매칭 함수 (Edge Function으로 구현 권장)
-- CREATE OR REPLACE FUNCTION process_matchmaking()

-- ================================================
-- 8. Realtime 활성화
-- ================================================

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.match_players;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.matchmaking_queue;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
