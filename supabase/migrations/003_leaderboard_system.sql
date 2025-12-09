-- ============================================================================
-- gICM Leaderboard System
-- Gamification with points, badges, and rankings
-- ============================================================================

-- ============================================================================
-- Table: gicm_users
-- User profiles for the marketplace
-- ============================================================================
CREATE TABLE IF NOT EXISTS gicm_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  github_url TEXT,
  twitter_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for username lookups
CREATE INDEX IF NOT EXISTS idx_gicm_users_username ON gicm_users(username);

-- ============================================================================
-- Table: points_ledger
-- Transaction log for all point changes
-- ============================================================================
CREATE TABLE IF NOT EXISTS points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES gicm_users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'stack_created', 'remix', 'share', 'first_install', etc.
  points INT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for points_ledger
CREATE INDEX IF NOT EXISTS idx_points_ledger_user_id ON points_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_points_ledger_action ON points_ledger(action);
CREATE INDEX IF NOT EXISTS idx_points_ledger_created_at ON points_ledger(created_at DESC);

-- ============================================================================
-- Table: leaderboard_cache
-- Cached rankings (updated periodically for performance)
-- ============================================================================
CREATE TABLE IF NOT EXISTS leaderboard_cache (
  user_id UUID PRIMARY KEY REFERENCES gicm_users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  total_points INT NOT NULL DEFAULT 0,
  rank INT NOT NULL DEFAULT 0,
  stacks_created INT DEFAULT 0,
  remixes_received INT DEFAULT 0,
  badges JSONB DEFAULT '[]',
  streak_days INT DEFAULT 0,
  last_activity TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for leaderboard_cache
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard_cache(rank ASC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_points ON leaderboard_cache(total_points DESC);

-- ============================================================================
-- Table: badges
-- Badge definitions
-- ============================================================================
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY, -- 'first_stack', 'power_user', etc.
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- emoji or icon name
  tier TEXT DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
  points_value INT DEFAULT 0, -- bonus points when earned
  criteria JSONB DEFAULT '{}', -- criteria to earn this badge
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Table: user_badges
-- Badges earned by users
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES gicm_users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Index for user_badges
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

-- ============================================================================
-- Table: live_events
-- Real-time activity feed (for live ticker)
-- ============================================================================
CREATE TABLE IF NOT EXISTS live_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user" TEXT NOT NULL,
  action TEXT NOT NULL, -- 'remixed', 'installed', 'starred'
  item TEXT NOT NULL,
  item_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for live_events queries
CREATE INDEX IF NOT EXISTS idx_live_events_created_at ON live_events(created_at DESC);

-- ============================================================================
-- Row Level Security
-- ============================================================================
ALTER TABLE gicm_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_events ENABLE ROW LEVEL SECURITY;

-- Public read access for leaderboard
CREATE POLICY "Public read leaderboard" ON leaderboard_cache FOR SELECT USING (true);
CREATE POLICY "Public read badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Public read user_badges" ON user_badges FOR SELECT USING (true);
CREATE POLICY "Public read live_events" ON live_events FOR SELECT USING (true);
CREATE POLICY "Public read gicm_users" ON gicm_users FOR SELECT USING (true);

-- Authenticated users can insert points/events (via API)
CREATE POLICY "Authenticated insert points" ON points_ledger FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated insert live_events" ON live_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated insert gicm_users" ON gicm_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated update leaderboard" ON leaderboard_cache FOR ALL USING (true);
CREATE POLICY "Authenticated insert user_badges" ON user_badges FOR INSERT WITH CHECK (true);

-- ============================================================================
-- Function: update_leaderboard_cache
-- Recalculates the leaderboard from points_ledger
-- ============================================================================
CREATE OR REPLACE FUNCTION update_leaderboard_cache()
RETURNS VOID AS $$
BEGIN
  -- Recalculate total points and ranks
  WITH user_totals AS (
    SELECT
      user_id,
      SUM(points) as total_points,
      COUNT(DISTINCT CASE WHEN action = 'stack_created' THEN id END) as stacks_created,
      MAX(created_at) as last_activity
    FROM points_ledger
    GROUP BY user_id
  ),
  ranked_users AS (
    SELECT
      ut.user_id,
      ut.total_points,
      ut.stacks_created,
      ut.last_activity,
      RANK() OVER (ORDER BY ut.total_points DESC) as rank
    FROM user_totals ut
  )
  INSERT INTO leaderboard_cache (
    user_id, username, display_name, avatar_url,
    total_points, rank, stacks_created, last_activity, updated_at
  )
  SELECT
    ru.user_id,
    u.username,
    u.display_name,
    u.avatar_url,
    ru.total_points,
    ru.rank,
    ru.stacks_created,
    ru.last_activity,
    NOW()
  FROM ranked_users ru
  JOIN gicm_users u ON u.id = ru.user_id
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = EXCLUDED.total_points,
    rank = EXCLUDED.rank,
    stacks_created = EXCLUDED.stacks_created,
    last_activity = EXCLUDED.last_activity,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Trigger: Auto-update leaderboard on points change
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_update_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_leaderboard_cache();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER points_ledger_update_leaderboard
  AFTER INSERT ON points_ledger
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_update_leaderboard();

-- ============================================================================
-- Insert default badges
-- ============================================================================
INSERT INTO badges (id, name, description, icon, tier, points_value, criteria) VALUES
  ('first_stack', 'First Stack', 'Created your first stack', '🎯', 'bronze', 10, '{"stacks_created": 1}'),
  ('power_user', 'Power User', 'Created 10+ stacks', '⚡', 'silver', 50, '{"stacks_created": 10}'),
  ('influencer', 'Influencer', 'Your stacks were remixed 5+ times', '🌟', 'gold', 100, '{"remixes_received": 5}'),
  ('explorer', 'Explorer', 'Used items from all categories', '🧭', 'silver', 25, '{"all_categories": true}'),
  ('web3_pioneer', 'Web3 Pioneer', 'Added 5+ Web3 agents to stacks', '🔗', 'silver', 30, '{"web3_agents": 5}'),
  ('security_master', 'Security Master', 'Added 10+ security items', '🛡️', 'gold', 50, '{"security_items": 10}'),
  ('early_adopter', 'Early Adopter', 'Joined during beta', '🚀', 'platinum', 100, '{"beta_user": true}'),
  ('streak_7', '7-Day Streak', 'Used gICM 7 days in a row', '🔥', 'bronze', 20, '{"streak_days": 7}'),
  ('streak_30', '30-Day Streak', 'Used gICM 30 days in a row', '🔥', 'gold', 75, '{"streak_days": 30}')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Apply updated_at trigger to gicm_users
-- ============================================================================
CREATE TRIGGER update_gicm_users_updated_at
  BEFORE UPDATE ON gicm_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
