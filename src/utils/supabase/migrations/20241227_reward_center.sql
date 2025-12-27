-- ============================================================================
-- REWARD CENTER SYSTEM
-- Phase 376-380: Point Redemption & Rewards Catalog
-- ============================================================================
-- ============================================================================
-- 1. REWARD ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reward_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Reward details
    reward_name VARCHAR(255) NOT NULL,
    description TEXT,
    reward_type VARCHAR(50) NOT NULL,
    -- 'discount', 'pulsa', 'cosmetic', 'voucher', 'premium_trial'
    -- Cost
    points_required INTEGER NOT NULL,
    -- Reward data (varies by type)
    reward_data JSONB,
    -- Examples:
    -- discount: {"type": "ebook", "percentage": 50}
    -- pulsa: {"amount": 5000, "manual": true}
    -- cosmetic: {"item_type": "avatar_frame", "frame_id": "premium_gold"}
    -- Image & display
    image_url TEXT,
    icon VARCHAR(50),
    -- Emoji or icon name
    -- Availability
    is_active BOOLEAN DEFAULT true,
    stock_available INTEGER,
    -- NULL = unlimited
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reward_items_active ON public.reward_items(is_active);
CREATE INDEX IF NOT EXISTS idx_reward_items_type ON public.reward_items(reward_type);
-- ============================================================================
-- 2. REDEMPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- User & reward
    user_id UUID NOT NULL,
    reward_id UUID REFERENCES public.reward_items(id) ON DELETE
    SET NULL,
        -- Reward details (snapshot)
        reward_name VARCHAR(255) NOT NULL,
        reward_type VARCHAR(50) NOT NULL,
        points_spent INTEGER NOT NULL,
        -- Redemption data
        redemption_data JSONB,
        -- Status
        status VARCHAR(20) DEFAULT 'pending',
        -- 'pending', 'fulfilled', 'cancelled'
        -- For manual fulfillment (e.g., pulsa)
        fulfillment_notes TEXT,
        fulfilled_at TIMESTAMPTZ,
        fulfilled_by UUID,
        -- Timestamps
        created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_redemptions_user ON public.redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON public.redemptions(status);
CREATE INDEX IF NOT EXISTS idx_redemptions_date ON public.redemptions(created_at DESC);
-- ============================================================================
-- 3. USER COSMETICS (For avatar frames, badges, etc)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_cosmetics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- User reference
    user_id UUID NOT NULL,
    -- Cosmetic item
    cosmetic_type VARCHAR(50) NOT NULL,
    -- 'avatar_frame', 'badge', 'title'
    cosmetic_id VARCHAR(100) NOT NULL,
    -- Active status
    is_equipped BOOLEAN DEFAULT false,
    -- Acquisition
    acquired_from VARCHAR(50),
    -- 'redemption', 'achievement', 'purchase'
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, cosmetic_type, cosmetic_id)
);
CREATE INDEX IF NOT EXISTS idx_user_cosmetics_user ON public.user_cosmetics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cosmetics_equipped ON public.user_cosmetics(user_id, is_equipped);
-- ============================================================================
-- 4. SEED REWARD ITEMS
-- ============================================================================
INSERT INTO public.reward_items (
        reward_name,
        description,
        reward_type,
        points_required,
        reward_data,
        icon,
        is_active
    )
VALUES (
        'Diskon 50% E-book',
        'Dapatkan kode diskon 50% untuk pembelian e-book premium',
        'discount',
        1000,
        '{"type": "ebook", "percentage": 50, "code_prefix": "EBOOK50"}'::jsonb,
        '📚',
        true
    ),
    (
        'Pulsa Rp 5.000',
        'Pulsa senilai Rp 5.000 (akan ditransfer manual oleh admin dalam 1x24 jam)',
        'pulsa',
        5000,
        '{"amount": 5000, "manual": true}'::jsonb,
        '📱',
        true
    ),
    (
        'Frame Avatar Gold',
        'Frame avatar eksklusif warna emas untuk profil Anda',
        'cosmetic',
        500,
        '{"item_type": "avatar_frame", "frame_id": "premium_gold", "color": "gold"}'::jsonb,
        '👑',
        true
    ),
    (
        'Frame Avatar Diamond',
        'Frame avatar super eksklusif warna diamond',
        'cosmetic',
        2000,
        '{"item_type": "avatar_frame", "frame_id": "premium_diamond", "color": "diamond"}'::jsonb,
        '💎',
        true
    ),
    (
        'Premium Trial 7 Hari',
        'Akses premium gratis selama 7 hari',
        'premium_trial',
        3000,
        '{"duration_days": 7}'::jsonb,
        '⭐',
        true
    ),
    (
        'Pulsa Rp 10.000',
        'Pulsa senilai Rp 10.000 (transfer manual 1x24 jam)',
        'pulsa',
        9000,
        '{"amount": 10000, "manual": true}'::jsonb,
        '📱',
        true
    ) ON CONFLICT DO NOTHING;
-- ============================================================================
-- 5. FUNCTION: Redeem Reward
-- ============================================================================
CREATE OR REPLACE FUNCTION redeem_reward(p_user_id UUID, p_reward_id UUID) RETURNS JSONB AS $$
DECLARE v_reward RECORD;
v_user_points INTEGER;
v_redemption_id UUID;
v_result JSONB;
BEGIN -- Get reward details
SELECT * INTO v_reward
FROM public.reward_items
WHERE id = p_reward_id
    AND is_active = true;
IF NOT FOUND THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'REWARD_NOT_FOUND',
    'message',
    'Reward not found or inactive'
);
END IF;
-- Check stock
IF v_reward.stock_available IS NOT NULL
AND v_reward.stock_available <= 0 THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'OUT_OF_STOCK',
    'message',
    'Reward is out of stock'
);
END IF;
-- Get user points
SELECT points_balance INTO v_user_points
FROM public.profiles
WHERE id = p_user_id;
-- Check if user has enough points
IF v_user_points < v_reward.points_required THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'INSUFFICIENT_POINTS',
    'message',
    'Not enough points. Need ' || v_reward.points_required || ', have ' || v_user_points
);
END IF;
-- Deduct points (using existing award_points function with negative value)
v_result := award_points(
    p_user_id,
    - v_reward.points_required,
    'redeem_reward',
    'Redeemed: ' || v_reward.reward_name,
    jsonb_build_object('reward_id', p_reward_id)
);
IF NOT (v_result->>'success')::boolean THEN RETURN v_result;
END IF;
-- Create redemption record
INSERT INTO public.redemptions (
        user_id,
        reward_id,
        reward_name,
        reward_type,
        points_spent,
        redemption_data,
        status
    )
VALUES (
        p_user_id,
        p_reward_id,
        v_reward.reward_name,
        v_reward.reward_type,
        v_reward.points_required,
        v_reward.reward_data,
        CASE
            WHEN v_reward.reward_type IN ('pulsa') THEN 'pending'
            ELSE 'fulfilled'
        END
    )
RETURNING id INTO v_redemption_id;
-- Update stock if applicable
IF v_reward.stock_available IS NOT NULL THEN
UPDATE public.reward_items
SET stock_available = stock_available - 1
WHERE id = p_reward_id;
END IF;
-- Handle cosmetic items
IF v_reward.reward_type = 'cosmetic' THEN
INSERT INTO public.user_cosmetics (
        user_id,
        cosmetic_type,
        cosmetic_id,
        acquired_from
    )
VALUES (
        p_user_id,
        (v_reward.reward_data->>'item_type')::VARCHAR,
        (v_reward.reward_data->>'frame_id')::VARCHAR,
        'redemption'
    ) ON CONFLICT DO NOTHING;
END IF;
RETURN jsonb_build_object(
    'success',
    true,
    'redemption_id',
    v_redemption_id,
    'reward_type',
    v_reward.reward_type,
    'message',
    'Successfully redeemed ' || v_reward.reward_name || '!',
    'new_balance',
    (v_result->>'new_balance')::INTEGER
);
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 6. RLS POLICIES
-- ============================================================================
ALTER TABLE public.reward_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reward items are viewable by everyone" ON public.reward_items FOR
SELECT USING (is_active = true);
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own redemptions" ON public.redemptions FOR
SELECT USING (auth.uid() = user_id);
ALTER TABLE public.user_cosmetics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own cosmetics" ON public.user_cosmetics FOR
SELECT USING (auth.uid() = user_id);
-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Reward Center created successfully!';
RAISE NOTICE '🎁 6 reward items seeded';
RAISE NOTICE '💎 Cosmetic system ready';
RAISE NOTICE '💰 Point redemption enabled';
RAISE NOTICE '🎯 Rewards ready to claim!';
END $$;