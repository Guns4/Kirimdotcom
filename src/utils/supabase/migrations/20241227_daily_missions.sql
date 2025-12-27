-- ============================================================================
-- DAILY MISSIONS / CHECK-IN SYSTEM
-- Phase 371-375: Daily Engagement & Streaks
-- ============================================================================
-- ============================================================================
-- 1. DAILY CHECK-IN TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.daily_check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- User reference
    user_id UUID NOT NULL,
    -- Check-in details
    check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
    -- Streak tracking
    current_streak INTEGER DEFAULT 1,
    -- Rewards
    points_awarded INTEGER NOT NULL,
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, check_in_date)
);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user ON public.daily_check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_date ON public.daily_check_ins(check_in_date DESC);
-- ============================================================================
-- 2. USER STREAK TRACKING (Add to profiles)
-- ============================================================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS check_in_streak INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_check_in_date DATE,
    ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
-- ============================================================================
-- 3. FUNCTION: Calculate Check-in Reward
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_checkin_reward(p_streak_day INTEGER) RETURNS INTEGER AS $$ BEGIN -- Progressive rewards based on streak day
    CASE
        p_streak_day
        WHEN 1 THEN RETURN 10;
WHEN 2 THEN RETURN 20;
WHEN 3 THEN RETURN 30;
WHEN 4 THEN RETURN 40;
WHEN 5 THEN RETURN 50;
WHEN 6 THEN RETURN 60;
WHEN 7 THEN RETURN 100;
-- Bonus on day 7
ELSE RETURN 10;
-- Reset cycle, same as day 1
END CASE
;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 4. FUNCTION: Process Daily Check-in
-- ============================================================================
CREATE OR REPLACE FUNCTION process_daily_checkin(p_user_id UUID) RETURNS JSONB AS $$
DECLARE v_last_checkin DATE;
v_current_streak INTEGER;
v_new_streak INTEGER;
v_points INTEGER;
v_longest_streak INTEGER;
BEGIN -- Get user's last check-in
SELECT last_check_in_date,
    check_in_streak,
    longest_streak INTO v_last_checkin,
    v_current_streak,
    v_longest_streak
FROM public.profiles
WHERE id = p_user_id;
-- Initialize if null
v_current_streak := COALESCE(v_current_streak, 0);
v_longest_streak := COALESCE(v_longest_streak, 0);
-- Check if already checked in today
IF v_last_checkin = CURRENT_DATE THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'ALREADY_CHECKED_IN',
    'message',
    'You already checked in today!',
    'current_streak',
    v_current_streak
);
END IF;
-- Calculate new streak
IF v_last_checkin = CURRENT_DATE - INTERVAL '1 day' THEN -- Consecutive day - increment streak
v_new_streak := v_current_streak + 1;
ELSE -- Missed a day - reset streak
v_new_streak := 1;
END IF;
-- Cycle back after day 7
IF v_new_streak > 7 THEN v_new_streak := ((v_new_streak - 1) % 7) + 1;
END IF;
-- Calculate points reward
v_points := calculate_checkin_reward(v_new_streak);
-- Update longest streak
IF v_new_streak > v_longest_streak THEN v_longest_streak := v_new_streak;
END IF;
-- Update user profile
UPDATE public.profiles
SET check_in_streak = v_new_streak,
    last_check_in_date = CURRENT_DATE,
    longest_streak = v_longest_streak
WHERE id = p_user_id;
-- Record check-in
INSERT INTO public.daily_check_ins (
        user_id,
        check_in_date,
        current_streak,
        points_awarded
    )
VALUES (
        p_user_id,
        CURRENT_DATE,
        v_new_streak,
        v_points
    );
-- Award points
PERFORM award_points(
    p_user_id,
    v_points,
    'daily_checkin',
    'Day ' || v_new_streak || ' check-in reward',
    jsonb_build_object('streak', v_new_streak)
);
RETURN jsonb_build_object(
    'success',
    true,
    'streak_day',
    v_new_streak,
    'points_awarded',
    v_points,
    'is_bonus_day',
    v_new_streak = 7,
    'message',
    CASE
        WHEN v_new_streak = 7 THEN 'Bonus day! +' || v_points || ' points! 🎉'
        ELSE 'Day ' || v_new_streak || ' check-in! +' || v_points || ' points'
    END
);
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 5. FUNCTION: Get Check-in Status
-- ============================================================================
CREATE OR REPLACE FUNCTION get_checkin_status(p_user_id UUID) RETURNS JSONB AS $$
DECLARE v_last_checkin DATE;
v_current_streak INTEGER;
v_longest_streak INTEGER;
v_can_checkin BOOLEAN;
v_next_reward INTEGER;
BEGIN -- Get user's check-in data
SELECT last_check_in_date,
    check_in_streak,
    longest_streak INTO v_last_checkin,
    v_current_streak,
    v_longest_streak
FROM public.profiles
WHERE id = p_user_id;
-- Initialize defaults
v_current_streak := COALESCE(v_current_streak, 0);
v_longest_streak := COALESCE(v_longest_streak, 0);
-- Check if can check in today
v_can_checkin := (
    v_last_checkin IS NULL
    OR v_last_checkin < CURRENT_DATE
);
-- Calculate next reward
IF v_can_checkin THEN IF v_last_checkin = CURRENT_DATE - INTERVAL '1 day' THEN v_next_reward := calculate_checkin_reward(v_current_streak + 1);
ELSE v_next_reward := calculate_checkin_reward(1);
-- Reset
END IF;
ELSE v_next_reward := 0;
END IF;
RETURN jsonb_build_object(
    'can_checkin',
    v_can_checkin,
    'current_streak',
    v_current_streak,
    'longest_streak',
    v_longest_streak,
    'last_checkin',
    v_last_checkin,
    'next_reward',
    v_next_reward,
    'checked_in_today',
    v_last_checkin = CURRENT_DATE
);
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 6. RLS POLICIES
-- ============================================================================
ALTER TABLE public.daily_check_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own check-ins" ON public.daily_check_ins FOR
SELECT USING (auth.uid() = user_id);
-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Daily Missions System created successfully!';
RAISE NOTICE '📅 Daily check-in tracking enabled';
RAISE NOTICE '🔥 Streak system implemented';
RAISE NOTICE '🎁 Progressive rewards (Day 1-7)';
RAISE NOTICE '💪 Daily engagement ready!';
END $$;