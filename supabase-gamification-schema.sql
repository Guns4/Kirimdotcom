-- ============================================
-- GAMIFICATION SYSTEM DATABASE SCHEMA
-- ============================================
-- Run in Supabase SQL Editor
-- ============================================
-- 1. ADD XP COLUMNS TO PROFILES
-- ============================================
-- Add XP and rank columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS xp_points INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS current_rank VARCHAR(50) DEFAULT 'Scout',
    ADD COLUMN IF NOT EXISTS rank_updated_at TIMESTAMP DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP DEFAULT NULL;
-- Create index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp_points DESC);
-- ============================================
-- 2. XP ACTIVITY LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS xp_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    xp_earned INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Index for user activity history
CREATE INDEX IF NOT EXISTS idx_xp_activities_user ON xp_activities(user_id, created_at DESC);
-- RLS for xp_activities
ALTER TABLE xp_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own XP activities" ON xp_activities FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert XP activities" ON xp_activities FOR
INSERT WITH CHECK (true);
-- ============================================
-- 3. RANK DEFINITIONS
-- ============================================
-- Ranks table for flexible configuration
CREATE TABLE IF NOT EXISTS ranks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    min_xp INTEGER NOT NULL,
    max_xp INTEGER,
    icon VARCHAR(50),
    color VARCHAR(50),
    benefits JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Insert default ranks
INSERT INTO ranks (name, min_xp, max_xp, icon, color, benefits)
VALUES ('Scout', 0, 50, '🔰', 'text-gray-400', '{}'),
    (
        'Navigator',
        51,
        200,
        '🧭',
        'text-blue-400',
        '{"reduced_ads": true}'
    ),
    (
        'Logistics Master',
        201,
        NULL,
        '🏆',
        'text-yellow-400',
        '{"no_ads": true, "priority_support": true}'
    ) ON CONFLICT (name) DO NOTHING;
-- ============================================
-- 4. XP EARNING FUNCTION
-- ============================================
DROP FUNCTION IF EXISTS add_user_xp(UUID, VARCHAR, INTEGER, TEXT);
CREATE OR REPLACE FUNCTION add_user_xp(
        p_user_id UUID,
        p_activity_type VARCHAR(50),
        p_xp_amount INTEGER,
        p_description TEXT DEFAULT NULL
    ) RETURNS TABLE(
        new_xp INTEGER,
        old_rank VARCHAR,
        new_rank VARCHAR,
        rank_changed BOOLEAN,
        premium_granted BOOLEAN
    ) AS $$
DECLARE v_current_xp INTEGER;
v_new_xp INTEGER;
v_old_rank VARCHAR(50);
v_new_rank VARCHAR(50);
v_rank_changed BOOLEAN := FALSE;
v_premium_granted BOOLEAN := FALSE;
BEGIN -- Get current XP and rank
SELECT xp_points,
    current_rank INTO v_current_xp,
    v_old_rank
FROM profiles
WHERE id = p_user_id;
-- Calculate new XP
v_new_xp := COALESCE(v_current_xp, 0) + p_xp_amount;
-- Determine new rank
SELECT r.name INTO v_new_rank
FROM ranks r
WHERE v_new_xp >= r.min_xp
    AND (
        r.max_xp IS NULL
        OR v_new_xp <= r.max_xp
    )
ORDER BY r.min_xp DESC
LIMIT 1;
-- Check if rank changed
v_rank_changed := (
    v_old_rank IS DISTINCT
    FROM v_new_rank
);
-- Update profiles
UPDATE profiles
SET xp_points = v_new_xp,
    current_rank = v_new_rank,
    rank_updated_at = CASE
        WHEN v_rank_changed THEN NOW()
        ELSE rank_updated_at
    END,
    -- Grant 7 days premium if reached Logistics Master
    premium_expires_at = CASE
        WHEN v_new_rank = 'Logistics Master'
        AND v_old_rank != 'Logistics Master' THEN NOW() + INTERVAL '7 days'
        ELSE premium_expires_at
    END
WHERE id = p_user_id;
-- Check if premium was granted
v_premium_granted := (
    v_new_rank = 'Logistics Master'
    AND v_old_rank != 'Logistics Master'
);
-- Log activity
INSERT INTO xp_activities (user_id, activity_type, xp_earned, description)
VALUES (
        p_user_id,
        p_activity_type,
        p_xp_amount,
        p_description
    );
-- Return results
RETURN QUERY
SELECT v_new_xp,
    v_old_rank,
    v_new_rank,
    v_rank_changed,
    v_premium_granted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ============================================
-- 5. CHECK USER PREMIUM STATUS
-- ============================================
DROP FUNCTION IF EXISTS is_user_premium(UUID);
CREATE OR REPLACE FUNCTION is_user_premium(p_user_id UUID) RETURNS BOOLEAN AS $$
DECLARE v_expires_at TIMESTAMP;
BEGIN
SELECT premium_expires_at INTO v_expires_at
FROM profiles
WHERE id = p_user_id;
RETURN v_expires_at IS NOT NULL
AND v_expires_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ============================================
-- 6. LEADERBOARD VIEW
-- ============================================
CREATE OR REPLACE VIEW leaderboard AS
SELECT p.id,
    p.display_name,
    p.avatar_url,
    p.xp_points,
    p.current_rank,
    r.icon as rank_icon,
    r.color as rank_color,
    ROW_NUMBER() OVER (
        ORDER BY p.xp_points DESC
    ) as position
FROM profiles p
    LEFT JOIN ranks r ON p.current_rank = r.name
WHERE p.xp_points > 0
ORDER BY p.xp_points DESC
LIMIT 100;
-- ============================================
-- 7. USER STATS VIEW
-- ============================================
CREATE OR REPLACE VIEW user_xp_stats AS
SELECT p.id as user_id,
    p.xp_points,
    p.current_rank,
    r.icon as rank_icon,
    r.color as rank_color,
    r.min_xp as current_rank_min_xp,
    COALESCE(next_rank.min_xp, r.min_xp) as next_rank_min_xp,
    COALESCE(next_rank.name, 'Max Level') as next_rank_name,
    CASE
        WHEN next_rank.min_xp IS NOT NULL THEN ROUND(
            (
                (p.xp_points - r.min_xp)::FLOAT / (next_rank.min_xp - r.min_xp)::FLOAT
            ) * 100
        )
        ELSE 100
    END as progress_percent,
    is_user_premium(p.id) as is_premium
FROM profiles p
    LEFT JOIN ranks r ON p.current_rank = r.name
    LEFT JOIN LATERAL (
        SELECT name,
            min_xp
        FROM ranks
        WHERE min_xp > COALESCE(r.max_xp, r.min_xp)
        ORDER BY min_xp ASC
        LIMIT 1
    ) next_rank ON true;