-- ============================================
-- GOD MODE PHASE 1401-1500: GAMIFICATION & LOYALTY
-- Game Economy, Gacha Control, Loyalty Tiers, Badges
-- ============================================
-- GACHA ITEMS TABLE (Hadiah/Rewards)
CREATE TABLE IF NOT EXISTS public.game_gacha_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    type VARCHAR(20) CHECK (
        type IN ('BALANCE', 'PHYSICAL', 'VOUCHER', 'ZONK')
    ),
    value DECIMAL(15, 2) DEFAULT 0,
    -- Value in IDR for balance/voucher
    probability_percent DECIMAL(5, 2) DEFAULT 1.0 CHECK (
        probability_percent >= 0
        AND probability_percent <= 100
    ),
    stock_limit INT,
    -- NULL = unlimited
    stock_remaining INT,
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    rarity VARCHAR(20) DEFAULT 'COMMON' CHECK (
        rarity IN ('COMMON', 'RARE', 'EPIC', 'LEGENDARY')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- LOYALTY TIERS TABLE (User Levels)
CREATE TABLE IF NOT EXISTS public.loyalty_tiers (
    id SERIAL PRIMARY KEY,
    tier_code VARCHAR(20) UNIQUE NOT NULL,
    -- BRONZE, SILVER, GOLD, DIAMOND
    tier_name VARCHAR(50) NOT NULL,
    min_spending DECIMAL(15, 2) DEFAULT 0,
    -- Minimum total spending to reach this tier
    benefit_desc TEXT,
    icon_url TEXT,
    color_hex VARCHAR(7),
    -- For UI theming
    gacha_discount_percent DECIMAL(5, 2) DEFAULT 0,
    -- Discount on gacha spin cost
    cashback_percent DECIMAL(5, 2) DEFAULT 0,
    -- Cashback on orders
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- GAME BADGES TABLE (Achievements)
CREATE TABLE IF NOT EXISTS public.game_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    badge_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    criteria_type VARCHAR(20) CHECK (
        criteria_type IN (
            'MANUAL',
            'AUTO_SPEND',
            'AUTO_ORDERS',
            'AUTO_REFERRAL'
        )
    ),
    criteria_value DECIMAL(15, 2),
    -- Threshold value for auto badges
    is_active BOOLEAN DEFAULT true,
    rarity VARCHAR(20) DEFAULT 'COMMON' CHECK (
        rarity IN ('COMMON', 'RARE', 'EPIC', 'LEGENDARY')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- USER BADGES JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES public.game_badges(id) ON DELETE CASCADE,
    awarded_by UUID REFERENCES public.users(id),
    -- Admin who gave it (if manual)
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, badge_id)
);
-- GACHA SPIN HISTORY TABLE (For analytics)
CREATE TABLE IF NOT EXISTS public.gacha_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    item_won_id UUID REFERENCES public.game_gacha_items(id),
    item_name VARCHAR(255),
    item_value DECIMAL(15, 2),
    spin_cost DECIMAL(15, 2) DEFAULT 5000,
    -- Cost per spin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gacha_items_active ON public.game_gacha_items(is_active);
CREATE INDEX IF NOT EXISTS idx_gacha_items_type ON public.game_gacha_items(type);
CREATE INDEX IF NOT EXISTS idx_loyalty_tiers_spending ON public.loyalty_tiers(min_spending);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_gacha_history_user ON public.gacha_history(user_id);
CREATE INDEX IF NOT EXISTS idx_gacha_history_created ON public.gacha_history(created_at DESC);
-- Row Level Security
ALTER TABLE public.game_gacha_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
-- Policies (Public read for active items)
DROP POLICY IF EXISTS "Anyone can view active gacha items" ON public.game_gacha_items;
CREATE POLICY "Anyone can view active gacha items" ON public.game_gacha_items FOR
SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Anyone can view tiers" ON public.loyalty_tiers;
CREATE POLICY "Anyone can view tiers" ON public.loyalty_tiers FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Users can view own badges" ON public.user_badges;
CREATE POLICY "Users can view own badges" ON public.user_badges FOR
SELECT USING (auth.uid() = user_id);
-- Seed Loyalty Tiers
INSERT INTO public.loyalty_tiers (
        tier_code,
        tier_name,
        min_spending,
        benefit_desc,
        color_hex,
        gacha_discount_percent,
        cashback_percent,
        display_order
    )
VALUES (
        'BRONZE',
        'Bronze Member',
        0,
        'Member baru - Mulai kumpulkan poin!',
        '#CD7F32',
        0,
        0,
        1
    ),
    (
        'SILVER',
        'Silver Member',
        1000000,
        'Cashback 1% + Diskon gacha 5%',
        '#C0C0C0',
        5,
        1,
        2
    ),
    (
        'GOLD',
        'Gold Member',
        10000000,
        'Cashback 2% + Diskon gacha 10%',
        '#FFD700',
        10,
        2,
        3
    ),
    (
        'DIAMOND',
        'Diamond VIP',
        50000000,
        'Cashback 5% + Diskon gacha 20% + Priority support',
        '#B9F2FF',
        20,
        5,
        4
    ) ON CONFLICT (tier_code) DO NOTHING;
-- Seed Sample Gacha Items
INSERT INTO public.game_gacha_items (
        name,
        type,
        value,
        probability_percent,
        rarity,
        display_order
    )
VALUES (
        'Zonk - Coba Lagi!',
        'ZONK',
        0,
        50.0,
        'COMMON',
        1
    ),
    (
        'Saldo Rp 5.000',
        'BALANCE',
        5000,
        20.0,
        'COMMON',
        2
    ),
    (
        'Saldo Rp 10.000',
        'BALANCE',
        10000,
        15.0,
        'COMMON',
        3
    ),
    (
        'Saldo Rp 25.000',
        'BALANCE',
        25000,
        8.0,
        'RARE',
        4
    ),
    (
        'Saldo Rp 50.000',
        'BALANCE',
        50000,
        4.0,
        'RARE',
        5
    ),
    (
        'Saldo Rp 100.000',
        'BALANCE',
        100000,
        2.0,
        'EPIC',
        6
    ),
    (
        'Voucher Ongkir Gratis',
        'VOUCHER',
        15000,
        0.8,
        'EPIC',
        7
    ),
    (
        'Saldo Rp 500.000',
        'BALANCE',
        500000,
        0.15,
        'LEGENDARY',
        8
    ),
    (
        'iPhone 15 Pro',
        'PHYSICAL',
        15000000,
        0.05,
        'LEGENDARY',
        9
    ) ON CONFLICT DO NOTHING;
-- Update stock_remaining to match stock_limit for physical items
UPDATE public.game_gacha_items
SET stock_limit = 10,
    stock_remaining = 10
WHERE type = 'PHYSICAL';
-- Seed Sample Badges
INSERT INTO public.game_badges (
        badge_code,
        name,
        description,
        criteria_type,
        criteria_value,
        rarity
    )
VALUES (
        'EARLY_BIRD',
        'Early Bird',
        'Salah satu user pertama CekKirim!',
        'MANUAL',
        NULL,
        'LEGENDARY'
    ),
    (
        'BIG_SPENDER',
        'Big Spender',
        'Belanja lebih dari Rp 10 Juta',
        'AUTO_SPEND',
        10000000,
        'EPIC'
    ),
    (
        'LOYAL_CUSTOMER',
        'Loyal Customer',
        'Sudah 50x order',
        'AUTO_ORDERS',
        50,
        'RARE'
    ),
    (
        'REFERRAL_KING',
        'Referral King',
        'Ajak 10 teman',
        'AUTO_REFERRAL',
        10,
        'RARE'
    ),
    (
        'BUG_HUNTER',
        'Bug Hunter',
        'Laporkan bug kritis',
        'MANUAL',
        NULL,
        'EPIC'
    ),
    (
        'BETA_TESTER',
        'Beta Tester',
        'Ikut program beta testing',
        'MANUAL',
        NULL,
        'RARE'
    ) ON CONFLICT (badge_code) DO NOTHING;
-- Function to calculate total gacha probability
CREATE OR REPLACE FUNCTION get_gacha_probability_total() RETURNS DECIMAL AS $$
DECLARE total DECIMAL;
BEGIN
SELECT COALESCE(SUM(probability_percent), 0) INTO total
FROM public.game_gacha_items
WHERE is_active = true;
RETURN total;
END;
$$ LANGUAGE plpgsql;
-- Function to get user tier based on spending
CREATE OR REPLACE FUNCTION get_user_tier(p_user_id UUID) RETURNS TABLE (
        tier_code VARCHAR,
        tier_name VARCHAR,
        min_spending DECIMAL,
        gacha_discount DECIMAL,
        cashback DECIMAL
    ) AS $$
DECLARE v_total_spending DECIMAL;
BEGIN -- Calculate total user spending (simplified - adjust based on your orders table)
SELECT COALESCE(SUM(total_amount), 0) INTO v_total_spending
FROM public.marketplace_orders
WHERE user_id = p_user_id
    AND status = 'COMPLETED';
-- Get appropriate tier
RETURN QUERY
SELECT lt.tier_code,
    lt.tier_name,
    lt.min_spending,
    lt.gacha_discount_percent,
    lt.cashback_percent
FROM public.loyalty_tiers lt
WHERE lt.min_spending <= v_total_spending
ORDER BY lt.min_spending DESC
LIMIT 1;
END;
$$ LANGUAGE plpgsql;
-- Function to get tier distribution stats
CREATE OR REPLACE FUNCTION get_tier_distribution() RETURNS TABLE (
        tier_name VARCHAR,
        user_count BIGINT,
        percentage DECIMAL
    ) AS $$
DECLARE total_users BIGINT;
BEGIN
SELECT COUNT(*) INTO total_users
FROM public.users;
RETURN QUERY WITH user_tiers AS (
    SELECT u.id,
        (
            SELECT tier_code
            FROM get_user_tier(u.id)
        ) as tier
    FROM public.users u
)
SELECT lt.tier_name,
    COUNT(ut.id) as user_count,
    ROUND(
        (
            COUNT(ut.id)::DECIMAL / NULLIF(total_users, 0) * 100
        ),
        2
    ) as percentage
FROM public.loyalty_tiers lt
    LEFT JOIN user_tiers ut ON ut.tier = lt.tier_code
GROUP BY lt.tier_name,
    lt.display_order
ORDER BY lt.display_order;
END;
$$ LANGUAGE plpgsql;
COMMENT ON TABLE public.game_gacha_items IS 'Gacha/lottery prize items with probability control';
COMMENT ON TABLE public.loyalty_tiers IS 'User loyalty tier levels based on spending (Bronze to Diamond)';
COMMENT ON TABLE public.game_badges IS 'Achievement badges that can be awarded to users';
COMMENT ON TABLE public.gacha_history IS 'History of gacha spins for analytics and fraud detection';