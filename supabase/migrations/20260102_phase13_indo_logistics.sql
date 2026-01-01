-- ============================================
-- GOD MODE PHASE 1101-1200: INDONESIAN LOGISTICS
-- COD Management, Courier Control, Domestic Operations
-- ============================================
-- COURIER CONFIGURATIONS TABLE (Ekspedisi Indonesia)
CREATE TABLE IF NOT EXISTS public.courier_configs (
    code VARCHAR(50) PRIMARY KEY,
    -- jne, jnt, sicepat, etc.
    name VARCHAR(100) NOT NULL,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    health_status VARCHAR(20) DEFAULT 'NORMAL' CHECK (
        health_status IN ('NORMAL', 'OVERLOAD', 'MAINTENANCE')
    ),
    cod_fee_percent DECIMAL(5, 2) DEFAULT 2.0,
    -- COD fee charged by courier
    admin_markup_percent DECIMAL(5, 2) DEFAULT 0,
    -- Admin profit markup
    base_price INT DEFAULT 10000,
    -- Base shipping price for calculation
    avg_delivery_days INT DEFAULT 3,
    supports_cod BOOLEAN DEFAULT true,
    supports_insurance BOOLEAN DEFAULT true,
    coverage_areas TEXT [],
    -- Array of supported areas
    last_status_check TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- COD RECONCILIATION TABLE (Rekonsiliasi Uang Tunai)
CREATE TABLE IF NOT EXISTS public.cod_reconciliations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    courier_code VARCHAR(50) REFERENCES public.courier_configs(code),
    transfer_date DATE NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    total_orders INT DEFAULT 0,
    file_url TEXT,
    -- CSV/PDF bukti transfer
    status VARCHAR(20) DEFAULT 'UNMATCHED' CHECK (
        status IN ('UNMATCHED', 'MATCHED', 'PARTIAL', 'COMPLETED')
    ),
    matched_amount DECIMAL(15, 2) DEFAULT 0,
    missing_amount DECIMAL(15, 2) DEFAULT 0,
    admin_notes TEXT,
    processed_by UUID REFERENCES public.users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- COD RECONCILIATION ITEMS (Detail per Order)
CREATE TABLE IF NOT EXISTS public.cod_reconciliation_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reconciliation_id UUID REFERENCES public.cod_reconciliations(id) ON DELETE CASCADE,
    tracking_number VARCHAR(100) NOT NULL,
    order_id UUID,
    expected_amount DECIMAL(15, 2),
    actual_amount DECIMAL(15, 2),
    status VARCHAR(20) CHECK (status IN ('MATCHED', 'MISSING', 'EXCESS')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- SHIPMENT ISSUES TABLE (Paket Bermasalah)
CREATE TABLE IF NOT EXISTS public.shipment_issues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_number VARCHAR(100) NOT NULL,
    order_id UUID,
    courier_code VARCHAR(50) REFERENCES public.courier_configs(code),
    issue_type VARCHAR(20) CHECK (
        issue_type IN (
            'LOST',
            'BROKEN',
            'STUCK',
            'RTS',
            'DELAYED',
            'OTHER'
        )
    ),
    description TEXT,
    reported_by UUID REFERENCES public.users(id),
    resolution_status VARCHAR(20) DEFAULT 'OPEN' CHECK (
        resolution_status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')
    ),
    resolution_notes TEXT,
    compensation_amount DECIMAL(15, 2),
    resolved_by UUID REFERENCES public.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_courier_active ON public.courier_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_courier_health ON public.courier_configs(health_status);
CREATE INDEX IF NOT EXISTS idx_cod_recon_status ON public.cod_reconciliations(status);
CREATE INDEX IF NOT EXISTS idx_cod_recon_date ON public.cod_reconciliations(transfer_date DESC);
CREATE INDEX IF NOT EXISTS idx_cod_items_tracking ON public.cod_reconciliation_items(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipment_issues_status ON public.shipment_issues(resolution_status);
CREATE INDEX IF NOT EXISTS idx_shipment_issues_type ON public.shipment_issues(issue_type);
-- Row Level Security
ALTER TABLE public.courier_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cod_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_issues ENABLE ROW LEVEL SECURITY;
-- Policies (Read-only for public courier list)
DROP POLICY IF EXISTS "Anyone can view active couriers" ON public.courier_configs;
CREATE POLICY "Anyone can view active couriers" ON public.courier_configs FOR
SELECT USING (is_active = true);
-- Seed Indonesian Courier Data
INSERT INTO public.courier_configs (
        code,
        name,
        logo_url,
        cod_fee_percent,
        avg_delivery_days,
        base_price
    )
VALUES (
        'jne',
        'JNE (Jalur Nugraha Ekakurir)',
        NULL,
        2.5,
        2,
        9000
    ),
    ('jnt', 'J&T Express', NULL, 2.0, 2, 7000),
    ('sicepat', 'SiCepat Ekspres', NULL, 2.0, 2, 8000),
    ('anteraja', 'AnterAja', NULL, 2.5, 3, 7500),
    ('gosend', 'GoSend (Instant)', NULL, 0, 0, 15000),
    -- Same day, no COD
    ('grabexpress', 'GrabExpress', NULL, 0, 0, 14000),
    ('ninja', 'Ninja Xpress', NULL, 2.0, 3, 7000),
    (
        'tiki',
        'TIKI (Titipan Kilat)',
        NULL,
        2.5,
        3,
        9500
    ),
    ('pos', 'Pos Indonesia', NULL, 1.5, 5, 6000),
    ('idexpress', 'ID Express', NULL, 2.0, 3, 7500) ON CONFLICT (code) DO NOTHING;
-- Update gosend and grabexpress to not support COD
UPDATE public.courier_configs
SET supports_cod = false
WHERE code IN ('gosend', 'grabexpress');
-- Function to calculate COD reconciliation summary
CREATE OR REPLACE FUNCTION calculate_cod_reconciliation(p_reconciliation_id UUID) RETURNS void AS $$
DECLARE v_matched DECIMAL;
v_total DECIMAL;
v_missing DECIMAL;
BEGIN -- Calculate matched amount
SELECT COALESCE(SUM(actual_amount), 0) INTO v_matched
FROM public.cod_reconciliation_items
WHERE reconciliation_id = p_reconciliation_id
    AND status = 'MATCHED';
-- Get total expected amount
SELECT total_amount INTO v_total
FROM public.cod_reconciliations
WHERE id = p_reconciliation_id;
-- Calculate missing
v_missing := v_total - v_matched;
-- Update reconciliation
UPDATE public.cod_reconciliations
SET matched_amount = v_matched,
    missing_amount = v_missing,
    status = CASE
        WHEN v_matched = v_total THEN 'MATCHED'
        WHEN v_matched = 0 THEN 'UNMATCHED'
        WHEN v_matched < v_total THEN 'PARTIAL'
        ELSE status
    END
WHERE id = p_reconciliation_id;
END;
$$ LANGUAGE plpgsql;
-- Function to get stuck shipments (no update > 3 days)
CREATE OR REPLACE FUNCTION get_stuck_shipments() RETURNS TABLE (
        tracking_number VARCHAR,
        courier_code VARCHAR,
        days_stuck INT,
        last_status VARCHAR,
        last_update TIMESTAMP WITH TIME ZONE
    ) AS $$ BEGIN -- This is a simplified version - in production, integrate with actual shipment tracking table
    RETURN QUERY
SELECT si.tracking_number,
    si.courier_code,
    EXTRACT(
        DAY
        FROM now() - si.created_at
    )::INT as days_stuck,
    'STUCK'::VARCHAR as last_status,
    si.created_at as last_update
FROM public.shipment_issues si
WHERE si.issue_type = 'STUCK'
    AND si.resolution_status = 'OPEN'
ORDER BY si.created_at ASC;
END;
$$ LANGUAGE plpgsql;
-- Function to toggle courier status
CREATE OR REPLACE FUNCTION toggle_courier_status(
        p_courier_code VARCHAR,
        p_is_active BOOLEAN DEFAULT NULL,
        p_health_status VARCHAR DEFAULT NULL
    ) RETURNS void AS $$ BEGIN
UPDATE public.courier_configs
SET is_active = COALESCE(p_is_active, is_active),
    health_status = COALESCE(p_health_status, health_status),
    updated_at = now()
WHERE code = p_courier_code;
END;
$$ LANGUAGE plpgsql;
COMMENT ON TABLE public.courier_configs IS 'Indonesian courier/ekspedisi configuration and status management';
COMMENT ON TABLE public.cod_reconciliations IS 'COD (Cash on Delivery) payment reconciliation from couriers';
COMMENT ON TABLE public.shipment_issues IS 'Problematic shipments tracking (lost, stuck, RTS, etc)';