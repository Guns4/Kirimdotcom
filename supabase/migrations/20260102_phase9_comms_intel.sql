-- ============================================
-- GOD MODE PHASE 601-700: COMMUNICATION & INTELLIGENCE
-- Announcements, Profit Analytics, Admin Productivity
-- ============================================
-- SYSTEM ANNOUNCEMENTS TABLE (Broadcast to Users)
CREATE TABLE IF NOT EXISTS public.system_announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'INFO' CHECK (
        type IN ('INFO', 'WARNING', 'PROMO', 'MAINTENANCE')
    ),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    target_users TEXT DEFAULT 'ALL',
    -- 'ALL', 'PRO_ONLY', 'FREE_ONLY'
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- ADMIN TODOS TABLE (Personal Task List)
CREATE TABLE IF NOT EXISTS public.admin_todos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task TEXT NOT NULL,
    is_done BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.system_announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_dates ON public.system_announcements(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_todos_done ON public.admin_todos(is_done);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON public.admin_todos(priority);
-- Row Level Security
ALTER TABLE public.system_announcements ENABLE ROW LEVEL SECURITY;
-- Policy: All users can read active announcements
DROP POLICY IF EXISTS "Users can read active announcements" ON public.system_announcements;
CREATE POLICY "Users can read active announcements" ON public.system_announcements FOR
SELECT USING (
        is_active = true
        AND start_date <= now()
        AND (
            end_date IS NULL
            OR end_date >= now()
        )
    );
-- Function to get active announcements for user dashboard
CREATE OR REPLACE FUNCTION get_active_announcements() RETURNS TABLE (
        id UUID,
        title VARCHAR,
        content TEXT,
        type VARCHAR,
        created_at TIMESTAMP WITH TIME ZONE
    ) AS $$ BEGIN RETURN QUERY
SELECT a.id,
    a.title,
    a.content,
    a.type,
    a.created_at
FROM public.system_announcements a
WHERE a.is_active = true
    AND a.start_date <= now()
    AND (
        a.end_date IS NULL
        OR a.end_date >= now()
    )
ORDER BY a.created_at DESC
LIMIT 5;
END;
$$ LANGUAGE plpgsql;
-- Function to calculate profit (revenue - costs)
CREATE OR REPLACE FUNCTION calculate_profit_summary(
        p_start_date DATE DEFAULT NULL,
        p_end_date DATE DEFAULT NULL
    ) RETURNS TABLE (
        total_revenue NUMERIC,
        total_cost NUMERIC,
        net_profit NUMERIC,
        profit_margin NUMERIC
    ) AS $$
DECLARE v_start_date DATE := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
v_end_date DATE := COALESCE(p_end_date, CURRENT_DATE);
BEGIN RETURN QUERY WITH order_stats AS (
    SELECT COALESCE(SUM(total_amount), 0) as revenue,
        COALESCE(
            SUM(
                CASE
                    WHEN p.price_base IS NOT NULL THEN p.price_base * oi.quantity
                    ELSE 0
                END
            ),
            0
        ) as cost
    FROM marketplace_orders mo
        LEFT JOIN marketplace_order_items oi ON mo.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
    WHERE mo.created_at::DATE BETWEEN v_start_date AND v_end_date
        AND mo.order_status IN ('COMPLETED', 'DELIVERED')
)
SELECT revenue,
    cost,
    revenue - cost as net_profit,
    CASE
        WHEN revenue > 0 THEN ((revenue - cost) / revenue * 100)
        ELSE 0
    END as profit_margin
FROM order_stats;
END;
$$ LANGUAGE plpgsql;
COMMENT ON TABLE public.system_announcements IS 'System-wide announcements and broadcasts to users';
COMMENT ON TABLE public.admin_todos IS 'Admin personal task list and todos';