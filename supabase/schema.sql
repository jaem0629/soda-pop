-- ================================================
-- SODA-POP Database Schema
-- Extended game mode support
-- ================================================

-- ================================================
-- Game Mode Definitions
-- ================================================
-- 
-- | Mode    | Players | Entry Type        |
-- |---------|---------|-------------------|
-- | solo    | 1       | private (instant) |
-- | battle  | 2       | private / public  |
--
-- ================================================

-- ================================================
-- 1. USERS Table
-- Integrated with Supabase Auth
-- ================================================

-- TODO: Supabase Auth 설정 후 활성화
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index: username search
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- ================================================
-- 2. MATCHES Table
-- ================================================

-- Game mode enum
DO $$
BEGIN
  CREATE TYPE game_mode AS ENUM ('solo', 'battle');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Entry type enum
DO $$
BEGIN
  CREATE TYPE entry_type AS ENUM ('private', 'public');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Match status enum
DO $$
BEGIN
  CREATE TYPE match_status AS ENUM ('waiting', 'matching', 'playing', 'finished', 'abandoned');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Game settings
  mode game_mode NOT NULL,
  entry_type entry_type NOT NULL,
  code VARCHAR(6) UNIQUE,  -- private only, NULL for public/solo
  
  -- Player settings
  max_players INT NOT NULL DEFAULT 2,
  team_size INT,  -- unused, kept for compatibility
  
  -- Status
  status match_status NOT NULL DEFAULT 'waiting',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_matches_code ON public.matches(code) WHERE code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status) WHERE status IN ('waiting', 'playing');
CREATE INDEX IF NOT EXISTS idx_matches_mode_status ON public.matches(mode, status) WHERE status IN ('waiting', 'playing');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'matches_mode_players_check'
      AND conrelid = 'public.matches'::regclass
  ) THEN
    ALTER TABLE public.matches
      ADD CONSTRAINT matches_mode_players_check
      CHECK (
        (mode = 'solo' AND entry_type = 'private' AND max_players = 1)
        OR (mode = 'battle' AND entry_type IN ('private', 'public') AND max_players = 2)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'matches_code_scope_check'
      AND conrelid = 'public.matches'::regclass
  ) THEN
    ALTER TABLE public.matches
      ADD CONSTRAINT matches_code_scope_check
      CHECK (
        (mode = 'battle' AND entry_type = 'private' AND code IS NOT NULL)
        OR (mode = 'battle' AND entry_type = 'public' AND code IS NULL)
        OR (mode = 'solo' AND code IS NULL)
      );
  END IF;
END $$;

-- ================================================
-- 3. MATCH_PLAYERS Table (N:M relationship)
-- ================================================

CREATE TABLE IF NOT EXISTS public.match_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  
  -- Player info
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,  -- NULL for anonymous
  player_name VARCHAR(20) NOT NULL,  -- Display name
  
  -- In-game info
  player_order INT NOT NULL,  -- Join order (1, 2, 3...)
  team_number INT,  -- unused, kept for compatibility
  score INT NOT NULL DEFAULT 0,
  
  -- Role
  is_host BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(match_id, player_order)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_match_players_match ON public.match_players(match_id);
CREATE INDEX IF NOT EXISTS idx_match_players_user ON public.match_players(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_match_players_unique_user
  ON public.match_players(match_id, user_id)
  WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_match_players_unique_host
  ON public.match_players(match_id)
  WHERE is_host = TRUE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'match_players_score_check'
      AND conrelid = 'public.match_players'::regclass
  ) THEN
    ALTER TABLE public.match_players
      ADD CONSTRAINT match_players_score_check
      CHECK (score >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'match_players_order_check'
      AND conrelid = 'public.match_players'::regclass
  ) THEN
    ALTER TABLE public.match_players
      ADD CONSTRAINT match_players_order_check
      CHECK (player_order > 0);
  END IF;
END $$;

-- ================================================
-- 4. MATCHMAKING_QUEUE Table
-- ================================================

-- Queue status enum
DO $$
BEGIN
  CREATE TYPE queue_status AS ENUM ('waiting', 'matched', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.matchmaking_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Player/team info
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  player_name VARCHAR(20) NOT NULL,  -- For anonymous users
  
  -- Matchmaking settings
  mode game_mode NOT NULL,
  team_id UUID,
  
  -- Status
  status queue_status DEFAULT 'waiting',
  matched_match_id UUID REFERENCES public.matches(id),
  
  -- Timestamps
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  matched_at TIMESTAMPTZ
);

-- Index: Find waiting players
CREATE INDEX IF NOT EXISTS idx_queue_waiting ON public.matchmaking_queue(mode, status, queued_at) 
  WHERE status = 'waiting';

-- ================================================
-- 5. RANKINGS Table
-- ================================================

CREATE TABLE IF NOT EXISTS public.rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Game info
  mode game_mode NOT NULL,
  match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  
  -- Player info
  user_ids UUID[] NOT NULL,
  player_names VARCHAR(20)[] NOT NULL,  -- For display
  
  -- Results
  score INT NOT NULL,
  is_winner BOOLEAN DEFAULT FALSE,  -- Winner in battle
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index: Ranking lookup by mode
CREATE INDEX IF NOT EXISTS idx_rankings_mode_score ON public.rankings(mode, score DESC);
CREATE INDEX IF NOT EXISTS idx_rankings_user ON public.rankings USING GIN(user_ids);

-- ================================================
-- 6. RLS Policies
-- ================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

-- TODO: Define detailed RLS policies
-- Currently open for development

-- users: Can only modify own data
CREATE POLICY "users_select" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_insert" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update" ON public.users FOR UPDATE USING (auth.uid() = id);

-- matches: Free to read, can only update own matches
CREATE POLICY "matches_select" ON public.matches FOR SELECT 
  USING (true);
CREATE POLICY "matches_insert" ON public.matches FOR INSERT WITH CHECK (true);
CREATE POLICY "matches_update" ON public.matches FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM match_players
      WHERE match_id = matches.id
        AND user_id = auth.uid()
    )
  );

-- match_players: Free to read/create, can only update/delete own data
CREATE POLICY "match_players_select" ON public.match_players FOR SELECT USING (true);
CREATE POLICY "match_players_insert" ON public.match_players FOR INSERT WITH CHECK (true);
CREATE POLICY "match_players_update" ON public.match_players FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "match_players_delete" ON public.match_players FOR DELETE USING (auth.uid() = user_id);

-- matchmaking_queue: Can only manage own queue
-- TODO: auth.uid() 체크 추가
CREATE POLICY "queue_select" ON public.matchmaking_queue FOR SELECT USING (true);
CREATE POLICY "queue_insert" ON public.matchmaking_queue FOR INSERT WITH CHECK (true);
CREATE POLICY "queue_update" ON public.matchmaking_queue FOR UPDATE USING (true);
CREATE POLICY "queue_delete" ON public.matchmaking_queue FOR DELETE USING (true);

-- rankings: Read for all, insert/update for own scores
CREATE POLICY "rankings_select" ON public.rankings FOR SELECT USING (true);
CREATE POLICY "rankings_insert" ON public.rankings FOR INSERT WITH CHECK (auth.uid() = ANY(user_ids));
CREATE POLICY "rankings_update" ON public.rankings FOR UPDATE USING (auth.uid() = ANY(user_ids));

-- ================================================
-- 7. Functions
-- ================================================

-- Cleanup function: Mark old matches as abandoned
CREATE OR REPLACE FUNCTION cleanup_old_matches()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mark matches as abandoned if playing for over 10 minutes
  UPDATE matches 
  SET status = 'abandoned'
  WHERE status = 'playing'
    AND started_at IS NOT NULL 
    AND started_at < NOW() - INTERVAL '10 minutes';
  
  -- Mark matches as abandoned if waiting for over 30 minutes
  UPDATE matches 
  SET status = 'abandoned'
  WHERE status = 'waiting'
    AND created_at < NOW() - INTERVAL '30 minutes';
  
  -- Cancel queue entries waiting for over 10 minutes
  UPDATE matchmaking_queue
  SET status = 'cancelled'
  WHERE status = 'waiting'
    AND queued_at < NOW() - INTERVAL '10 minutes';
    
END;
$$;

-- TODO: Matchmaking function (recommended to implement as Edge Function)
-- CREATE OR REPLACE FUNCTION process_matchmaking()

-- ================================================
-- 9. Banned Words
-- ================================================

CREATE TABLE IF NOT EXISTS public.banned_words (
  id SERIAL PRIMARY KEY,
  word TEXT NOT NULL UNIQUE
);

ALTER TABLE public.banned_words ENABLE ROW LEVEL SECURITY;

-- No direct access for any user — managed via service role only
CREATE POLICY "banned_words_no_access" ON public.banned_words USING (false);

-- Check function: bypasses RLS via SECURITY DEFINER
CREATE OR REPLACE FUNCTION is_banned_word(input TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.banned_words
    WHERE lower(input) LIKE '%' || lower(word) || '%'
  );
$$;

-- Sync player_names in rankings when a user changes their username
CREATE OR REPLACE FUNCTION sync_rankings_player_names()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.username = OLD.username THEN
    RETURN NEW;
  END IF;

  UPDATE public.rankings
  SET player_names = (
    SELECT array_agg(
      CASE
        WHEN user_ids[idx] = NEW.id THEN NEW.username
        ELSE player_names[idx]
      END
      ORDER BY idx
    )
    FROM generate_subscripts(user_ids, 1) AS idx
  )
  WHERE NEW.id = ANY(user_ids);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_username_change
  AFTER UPDATE OF username ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_rankings_player_names();

-- ================================================
-- 8. Enable Realtime
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
