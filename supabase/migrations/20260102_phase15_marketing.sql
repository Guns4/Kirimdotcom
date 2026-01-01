-- ============================================
-- GOD MODE PHASE 1501-1600: MARKETING INTELLIGENCE
-- RFM Segmentation, Funnel Analysis, A/B Testing, Marketing Automation
-- ============================================
-- MARKETING RFM SEGMENTS TABLE (Customer Segmentation)
CREATE TABLE IF NOT EXISTS public.marketing_rfm_segments (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    recency_score INT CHECK (
        recency_score >= 1
        AND recency_score <= 5
    ),
    frequency_score INT CHECK (
        frequency_score >= 1
        AND frequency_score <= 5
    ),
    monetary_score INT CHECK (
        monetary_score >= 1
        AND monetary_score <= 5
    ),
    segment_name VARCHAR(50) CHECK (
        segment_name IN (
            'CHAMPIONS',
            'LOYAL',
            'POTENTIAL',
            'AT_RISK',
            'HIBERNATING',
            'LOST'
        )
    ),
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(15, 2) DEFAULT 0,
    last_order_date TIMESTAMP WITH TIME ZONE,
    days_since_last_order INT,
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- A/B TESTING CONFIG TABLE
CREATE TABLE IF NOT EXISTS public.marketing_ab_tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    variant_a_label VARCHAR(50) DEFAULT 'Control',
    variant_b_label VARCHAR(50) DEFAULT 'Variant',
    traffic_split_percent DECIMAL(5, 2) DEFAULT 50.0 CHECK (
        traffic_split_percent >= 0
        AND traffic_split_percent <= 100
    ),
    is_active BOOLEAN DEFAULT false,
    winner_variant VARCHAR(10) CHECK (winner_variant IN ('A', 'B', 'TIE', NULL)),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    variant_a_conversions INT DEFAULT 0,
    variant_b_conversions INT DEFAULT 0,
    variant_a_views INT DEFAULT 0,
    variant_b_views INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- MARKETING AUTOMATION CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS public.marketing_automations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_name VARCHAR(100) NOT NULL,
    trigger_event VARCHAR(50) CHECK (
        trigger_event IN (
            'CART_ABANDONED',
            'NO_LOGIN_30DAYS',
            'FIRST_ORDER',
            'VIP_UPGRADE',
            'BIRTHDAY',
            'CUSTOM'
        )
    ),
    action_type VARCHAR(20) CHECK (
        action_type IN ('WHATSAPP', 'EMAIL', 'PUSH', 'SMS')
    ),
    message_template TEXT,
    delay_minutes INT DEFAULT 0,
    -- Send after X minutes from trigger
    target_segment VARCHAR(50),
    -- Target specific RFM segment
    is_active BOOLEAN DEFAULT true,
    total_sent INT DEFAULT 0,
    total_conversions INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- MARKETING CAMPAIGN LOGS TABLE
CREATE TABLE IF NOT EXISTS public.marketing_campaign_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    automation_id UUID REFERENCES public.marketing_automations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    converted BOOLEAN DEFAULT false,
    converted_at TIMESTAMP WITH TIME ZONE
);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rfm_segment ON public.marketing_rfm_segments(segment_name);
CREATE INDEX IF NOT EXISTS idx_rfm_scores ON public.marketing_rfm_segments(recency_score, frequency_score, monetary_score);
CREATE INDEX IF NOT EXISTS idx_ab_tests_active ON public.marketing_ab_tests(is_active);
CREATE INDEX IF NOT EXISTS idx_automations_active ON public.marketing_automations(is_active);
CREATE INDEX IF NOT EXISTS idx_automations_trigger ON public.marketing_automations(trigger_event);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_user ON public.marketing_campaign_logs(user_id);
-- Row Level Security
ALTER TABLE public.marketing_rfm_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_automations ENABLE ROW LEVEL SECURITY;
-- Function to calculate RFM segments
CREATE OR REPLACE FUNCTION calculate_rfm_segments() RETURNS TABLE (
        user_id UUID,
        segment_name VARCHAR,
        recency_score INT,
        frequency_score INT,
        monetary_score INT
    ) AS $$ BEGIN -- This is a simplified RFM calculation
    -- In production, this would be run as a background job
    RETURN QUERY WITH user_stats AS (
        SELECT u.id as user_id,
            COUNT(mo.id) as order_count,
            COALESCE(SUM(mo.total_amount), 0) as total_spent,
            MAX(mo.created_at) as last_order_date,
            EXTRACT(
                DAY
                FROM now() - MAX(mo.created_at)
            )::INT as days_since_last_order
        FROM public.users u
            LEFT JOIN public.marketplace_orders mo ON u.id = mo.user_id
            AND mo.status = 'COMPLETED'
        GROUP BY u.id
    ),
    rfm_scores AS (
        SELECT user_id,
            -- Recency: 5 = recent, 1 = long ago
            CASE
                WHEN days_since_last_order IS NULL THEN 1
                WHEN days_since_last_order <= 7 THEN 5
                WHEN days_since_last_order <= 30 THEN 4
                WHEN days_since_last_order <= 90 THEN 3
                WHEN days_since_last_order <= 180 THEN 2
                ELSE 1
            END as r_score,
            -- Frequency: 5 = many orders, 1 = few orders
            CASE
                WHEN order_count >= 20 THEN 5
                WHEN order_count >= 10 THEN 4
                WHEN order_count >= 5 THEN 3
                WHEN order_count >= 2 THEN 2
                ELSE 1
            END as f_score,
            -- Monetary: 5 = high spending, 1 = low spending
            CASE
                WHEN total_spent >= 10000000 THEN 5
                WHEN total_spent >= 5000000 THEN 4
                WHEN total_spent >= 1000000 THEN 3
                WHEN total_spent >= 100000 THEN 2
                ELSE 1
            END as m_score
        FROM user_stats
    )
SELECT rfm_scores.user_id,
    CASE
        WHEN r_score >= 4
        AND f_score >= 4
        AND m_score >= 4 THEN 'CHAMPIONS'::VARCHAR
        WHEN r_score >= 3
        AND f_score >= 3 THEN 'LOYAL'::VARCHAR
        WHEN r_score >= 4
        AND f_score <= 2 THEN 'POTENTIAL'::VARCHAR
        WHEN r_score <= 2
        AND f_score >= 3 THEN 'AT_RISK'::VARCHAR
        WHEN r_score <= 2
        AND f_score <= 2
        AND m_score >= 3 THEN 'HIBERNATING'::VARCHAR
        ELSE 'LOST'::VARCHAR
    END as segment_name,
    r_score as recency_score,
    f_score as frequency_score,
    m_score as monetary_score
FROM rfm_scores;
END;
$$ LANGUAGE plpgsql;
-- Function to get segment distribution
CREATE OR REPLACE FUNCTION get_segment_distribution() RETURNS TABLE (
        segment_name VARCHAR,
        user_count BIGINT,
        percentage DECIMAL,
        avg_spent DECIMAL
    ) AS $$
DECLARE total_users BIGINT;
BEGIN
SELECT COUNT(*) INTO total_users
FROM public.marketing_rfm_segments;
RETURN QUERY
SELECT mrs.segment_name,
    COUNT(*)::BIGINT as user_count,
    ROUND(
        (COUNT(*)::DECIMAL / NULLIF(total_users, 0) * 100),
        2
    ) as percentage,
    ROUND(AVG(mrs.total_spent), 2) as avg_spent
FROM public.marketing_rfm_segments mrs
GROUP BY mrs.segment_name
ORDER BY user_count DESC;
END;
$$ LANGUAGE plpgsql;
-- Function to calculate funnel metrics
CREATE OR REPLACE FUNCTION get_funnel_metrics() RETURNS TABLE (
        step_name VARCHAR,
        user_count BIGINT,
        conversion_rate DECIMAL
    ) AS $$
DECLARE total_visitors BIGINT;
BEGIN -- Get total registered users as baseline
SELECT COUNT(*) INTO total_visitors
FROM public.users;
RETURN QUERY
SELECT 'Registered'::VARCHAR as step_name,
    total_visitors,
    100.00::DECIMAL as conversion_rate
UNION ALL
SELECT 'First Topup'::VARCHAR,
    COUNT(DISTINCT user_id)::BIGINT,
    ROUND(
        (
            COUNT(DISTINCT user_id)::DECIMAL / NULLIF(total_visitors, 0) * 100
        ),
        2
    )
FROM public.topup_transactions
WHERE status = 'SUCCESS'
UNION ALL
SELECT 'First Order'::VARCHAR,
    COUNT(DISTINCT user_id)::BIGINT,
    ROUND(
        (
            COUNT(DISTINCT user_id)::DECIMAL / NULLIF(total_visitors, 0) * 100
        ),
        2
    )
FROM public.marketplace_orders
WHERE status IN ('COMPLETED', 'PROCESSING')
UNION ALL
SELECT 'Repeat Customer'::VARCHAR,
    COUNT(DISTINCT user_id)::BIGINT,
    ROUND(
        (
            COUNT(DISTINCT user_id)::DECIMAL / NULLIF(total_visitors, 0) * 100
        ),
        2
    )
FROM (
        SELECT user_id,
            COUNT(*) as order_count
        FROM public.marketplace_orders
        WHERE status = 'COMPLETED'
        GROUP BY user_id
        HAVING COUNT(*) >= 2
    ) repeat_users;
END;
$$ LANGUAGE plpgsql;
-- Seed sample A/B tests
INSERT INTO public.marketing_ab_tests (
        test_name,
        description,
        variant_a_label,
        variant_b_label
    )
VALUES (
        'HOMEPAGE_HERO',
        'Test hero section impact on registration',
        'Original Hero',
        'New Hero'
    ),
    (
        'CHECKOUT_BUTTON_COLOR',
        'Test button color on conversion',
        'Blue Button',
        'Green Button'
    ),
    (
        'PRICING_DISPLAY',
        'Test pricing visibility',
        'Hidden Fees',
        'Transparent Pricing'
    ) ON CONFLICT (test_name) DO NOTHING;
-- Seed sample automation campaigns
INSERT INTO public.marketing_automations (
        campaign_name,
        trigger_event,
        action_type,
        message_template,
        delay_minutes
    )
VALUES (
        'Cart Abandonment',
        'CART_ABANDONED',
        'WHATSAPP',
        'Halo! Kamu tinggalkan barang di keranjang. Yuk checkout sebelum kehabisan! 🛒',
        60
    ),
    (
        'Welcome Series',
        'FIRST_ORDER',
        'WHATSAPP',
        'Terima kasih sudah order pertama! Dapatkan voucher 10% untuk order berikutnya 🎉',
        0
    ),
    (
        'Re-engagement',
        'NO_LOGIN_30DAYS',
        'PUSH',
        'Kangen kamu! Ada promo spesial buat comeback-mu 💝',
        0
    ) ON CONFLICT DO NOTHING;
COMMENT ON TABLE public.marketing_rfm_segments IS 'RFM customer segmentation for targeted marketing';
COMMENT ON TABLE public.marketing_ab_tests IS 'A/B testing configuration and results tracking';
COMMENT ON TABLE public.marketing_automations IS 'Marketing automation campaign triggers and templates';