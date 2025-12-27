-- ============================================================================
-- LOYALTY POINTS SYSTEM
-- Phase 366-370: Gamification & User Engagement
-- ============================================================================
-- ============================================================================
-- 1. ADD POINTS TO PROFILES TABLE
-- ============================================================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS points_balance INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_profiles_points ON public.profiles(points_balance DESC);
-- ============================================================================
-- 2. POINT HISTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.point_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- User reference
    user_id UUID NOT NULL,
    -- Transaction details
    points_change INTEGER NOT NULL,
    -- Positive for earning, negative for spending
    action_type VARCHAR(50) NOT NULL,
    -- 'daily_login', 'check_resi', 'share_social', 'redeem', etc.
    description TEXT,
    -- Balance tracking
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    -- Metadata
    metadata JSONB,
    -- For additional context like resi_number, share_platform, etc.
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_point_history_user ON public.point_history(user_id);
CREATE INDEX IF NOT EXISTS idx_point_history_type ON public.point_history(action_type);
CREATE INDEX IF NOT EXISTS idx_point_history_date ON public.point_history(created_at DESC);
-- ============================================================================
-- 3. DAILY ACTION TRACKING (Prevent spam)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.daily_point_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- User & action
    user_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    action_date DATE NOT NULL DEFAULT CURRENT_DATE,
    -- Counter
    count INTEGER DEFAULT 1,
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, action_type, action_date)
);
CREATE INDEX IF NOT EXISTS idx_daily_actions_user_date ON public.daily_point_actions(user_id, action_date);
-- ============================================================================
-- 4. FUNCTION: Award Points
-- ============================================================================
CREATE OR REPLACE FUNCTION award_points(
        p_user_id UUID,
        p_points INTEGER,
        p_action_type VARCHAR,
        p_description TEXT DEFAULT NULL,
        p_metadata JSONB DEFAULT NULL
    ) RETURNS JSONB AS $$
DECLARE v_balance_before INTEGER;
v_balance_after INTEGER;
v_result JSONB;
BEGIN -- Get current balance
SELECT COALESCE(points_balance, 0) INTO v_balance_before
FROM public.profiles
WHERE id = p_user_id;
-- Calculate new balance
v_balance_after := v_balance_before + p_points;
-- Ensure balance doesn't go negative
IF v_balance_after < 0 THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'INSUFFICIENT_POINTS',
    'message',
    'Not enough points'
);
END IF;
-- Update user balance
UPDATE public.profiles
SET points_balance = v_balance_after
WHERE id = p_user_id;
-- Log transaction
INSERT INTO public.point_history (
        user_id,
        points_change,
        action_type,
        description,
        balance_before,
        balance_after,
        metadata
    )
VALUES (
        p_user_id,
        p_points,
        p_action_type,
        p_description,
        v_balance_before,
        v_balance_after,
        p_metadata
    );
RETURN jsonb_build_object(
    'success',
    true,
    'points_awarded',
    p_points,
    'new_balance',
    v_balance_after
);
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 5. FUNCTION: Check Daily Action Limit
-- ============================================================================
CREATE OR REPLACE FUNCTION can_earn_daily_points(
        p_user_id UUID,
        p_action_type VARCHAR,
        p_max_count INTEGER
    ) RETURNS BOOLEAN AS $$
DECLARE v_today_count INTEGER;
BEGIN -- Get today's count for this action
SELECT COALESCE(count, 0) INTO v_today_count
FROM public.daily_point_actions
WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND action_date = CURRENT_DATE;
-- Check if under limit
RETURN v_today_count < p_max_count;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 6. FUNCTION: Record Daily Action
-- ============================================================================
CREATE OR REPLACE FUNCTION record_daily_action(p_user_id UUID, p_action_type VARCHAR) RETURNS VOID AS $$ BEGIN
INSERT INTO public.daily_point_actions (
        user_id,
        action_type,
        action_date,
        count
    )
VALUES (
        p_user_id,
        p_action_type,
        CURRENT_DATE,
        1
    ) ON CONFLICT (user_id, action_type, action_date) DO
UPDATE
SET count = daily_point_actions.count + 1;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 7. RLS POLICIES
-- ============================================================================
ALTER TABLE public.point_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own point history" ON public.point_history FOR
SELECT USING (auth.uid() = user_id);
ALTER TABLE public.daily_point_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own daily actions" ON public.daily_point_actions FOR
SELECT USING (auth.uid() = user_id);
-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Loyalty Points System created successfully!';
RAISE NOTICE '🎮 Points added to profiles table';
RAISE NOTICE '📊 Point history tracking enabled';
RAISE NOTICE '🎯 Daily action limits implemented';
RAISE NOTICE '💎 Gamification ready!';
END $$;