-- ================================================
-- SODA-POP Database Schema
-- 현재: 익명 사용 / 추후: 계정 연동 확장 가능
-- ================================================

-- ================================================
-- 1. 테이블 정의
-- ================================================

CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) NOT NULL UNIQUE,
  player1_name VARCHAR(50) NOT NULL,
  player2_name VARCHAR(50),
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ DEFAULT NULL
);

-- 인덱스: 코드로 방 조회 최적화
CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms(code);

-- 인덱스: 활성 방 조회 최적화
CREATE INDEX IF NOT EXISTS idx_rooms_expired_at ON public.rooms(expired_at) WHERE expired_at IS NULL;

-- ================================================
-- 2. RLS (Row Level Security) 활성화
-- ================================================

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 3. RLS 정책 정의
-- ================================================

-- 기존 정책 삭제 (재실행 시 충돌 방지)
DROP POLICY IF EXISTS "Allow all operations on rooms" ON public.rooms;
DROP POLICY IF EXISTS "View active rooms only" ON public.rooms;
DROP POLICY IF EXISTS "Anyone can create rooms" ON public.rooms;
DROP POLICY IF EXISTS "Update active rooms only" ON public.rooms;
DROP POLICY IF EXISTS "No hard deletes" ON public.rooms;
DROP POLICY IF EXISTS "select_active_rooms" ON public.rooms;
DROP POLICY IF EXISTS "insert_rooms" ON public.rooms;
DROP POLICY IF EXISTS "update_active_rooms" ON public.rooms;
DROP POLICY IF EXISTS "delete_rooms" ON public.rooms;

-- SELECT: 활성 방만 조회 가능
-- 추후 확장: auth.uid() = player1_id OR auth.uid() = player2_id
CREATE POLICY "select_active_rooms"
ON public.rooms FOR SELECT
USING (expired_at IS NULL);

-- INSERT: 방 생성 허용
-- 추후 확장: auth.uid() IS NOT NULL
CREATE POLICY "insert_rooms"
ON public.rooms FOR INSERT
WITH CHECK (true);

-- UPDATE: 활성 방만 수정 가능
-- 추후 확장: auth.uid() IN (player1_id, player2_id)
CREATE POLICY "update_active_rooms"
ON public.rooms FOR UPDATE
USING (expired_at IS NULL)
WITH CHECK (expired_at IS NULL);

-- DELETE: 관리자/서버 함수용 (하드 삭제 필요 시)
-- 추후 확장: auth.uid() = player1_id (방장만 삭제)
CREATE POLICY "delete_rooms"
ON public.rooms FOR DELETE
USING (true);

-- ================================================
-- 4. 함수 정의
-- ================================================

-- Cleanup 함수: GitHub Actions에서 주기적으로 호출
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 게임 시작 후 5분 지난 방 만료 (중도 이탈 시 abandoned 처리)
  UPDATE rooms 
  SET expired_at = NOW(),
      status = CASE 
        WHEN status = 'playing' THEN 'abandoned'
        ELSE status 
      END
  WHERE expired_at IS NULL
    AND started_at IS NOT NULL 
    AND started_at < NOW() - INTERVAL '5 minutes';
  
  -- 대기만 하다 30분 지난 방 만료
  UPDATE rooms 
  SET expired_at = NOW()
  WHERE expired_at IS NULL
    AND started_at IS NULL 
    AND created_at < NOW() - INTERVAL '30 minutes';
END;
$$;

-- ================================================
-- 5. Realtime 활성화
-- ================================================

-- Supabase Dashboard에서 Realtime 활성화 필요:
-- Database > Replication > rooms 테이블 활성화
-- 또는 아래 SQL 실행 (이미 추가되어 있으면 무시):
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
