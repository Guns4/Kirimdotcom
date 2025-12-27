-- =============================================================================
-- STUCK PACKAGE DETECTOR SYSTEM
-- Phase 436-440: Proactive Problem Solving
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =============================================================================
-- 1. TRACKED PACKAGES TABLE (for monitoring)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.tracked_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Owner
    user_id UUID NOT NULL,
    -- Package info
    awb_number VARCHAR(50) NOT NULL,
    courier VARCHAR(50) NOT NULL,
    -- Customer info
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    destination VARCHAR(255),
    -- Status tracking
    current_status VARCHAR(100),
    last_status_update TIMESTAMPTZ,
    -- Stuck detection
    is_stuck BOOLEAN DEFAULT false,
    stuck_detected_at TIMESTAMPTZ,
    days_without_update INTEGER DEFAULT 0,
    -- Resolution
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolution_note TEXT,
    -- Flags
    is_active BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, awb_number)
);
CREATE INDEX IF NOT EXISTS idx_tracked_awb ON public.tracked_packages(awb_number);
CREATE INDEX IF NOT EXISTS idx_tracked_user ON public.tracked_packages(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_stuck ON public.tracked_packages(is_stuck, user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_status ON public.tracked_packages(last_status_update);
-- =============================================================================
-- 2. STUCK ALERTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.stuck_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- References
    user_id UUID NOT NULL,
    package_id UUID NOT NULL REFERENCES public.tracked_packages(id) ON DELETE CASCADE,
    -- Alert info
    alert_type VARCHAR(50) NOT NULL,
    -- 'stuck_3_days', 'stuck_5_days', 'stuck_7_days'
    severity VARCHAR(20) NOT NULL,
    -- 'warning', 'danger', 'critical'
    -- Details
    days_stuck INTEGER NOT NULL,
    last_known_status VARCHAR(100),
    last_known_location TEXT,
    -- Status
    is_read BOOLEAN DEFAULT false,
    is_resolved BOOLEAN DEFAULT false,
    complaint_sent BOOLEAN DEFAULT false,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_stuck_alerts_user ON public.stuck_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_stuck_alerts_unread ON public.stuck_alerts(user_id, is_read);
-- =============================================================================
-- 3. COMPLAINT TEMPLATES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.complaint_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Courier
    courier VARCHAR(50) NOT NULL,
    -- Contact info
    cs_phone VARCHAR(20),
    cs_email VARCHAR(255),
    cs_whatsapp VARCHAR(20),
    -- Templates
    email_template TEXT NOT NULL,
    whatsapp_template TEXT NOT NULL,
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 4. SEED: Complaint Templates for Major Couriers
-- =============================================================================
INSERT INTO public.complaint_templates (
        courier,
        cs_phone,
        cs_email,
        cs_whatsapp,
        email_template,
        whatsapp_template
    )
VALUES (
        'jne',
        '021-29278888',
        'customercare@jne.co.id',
        '628118292728',
        'Yth. Customer Care JNE,

Saya ingin melaporkan paket yang tidak ada update selama {DAYS} hari.

Detail Paket:
- No. Resi: {AWB}
- Pengirim: {SENDER_NAME}
- Penerima: {CUSTOMER_NAME}
- Tujuan: {DESTINATION}
- Status Terakhir: {LAST_STATUS}

Mohon bantuan untuk tracking dan percepatan pengiriman.

Terima kasih.',
        'Halo JNE 👋

Saya mau komplain paket *{AWB}* yang stuck {DAYS} hari.

Penerima: {CUSTOMER_NAME}
Tujuan: {DESTINATION}

Mohon bantuannya 🙏'
    ),
    (
        'jnt',
        '021-80661888',
        'jntcallcenter@jet.co.id',
        '628118811888',
        'Yth. Customer Care J&T Express,

Paket dengan resi {AWB} tidak ada pergerakan selama {DAYS} hari.

Detail:
- Penerima: {CUSTOMER_NAME}
- Tujuan: {DESTINATION}
- Status: {LAST_STATUS}

Mohon segera ditindaklanjuti.

Terima kasih.',
        'Halo J&T 👋

Paket *{AWB}* stuck {DAYS} hari.
Ke: {DESTINATION}

Tolong dicek ya 🙏'
    ),
    (
        'sicepat',
        '021-50200050',
        'customer.care@sicepat.com',
        '6281287000050',
        'Yth. SiCepat Ekspres,

Mohon bantuan untuk paket {AWB} yang macet {DAYS} hari.

- Penerima: {CUSTOMER_NAME}
- Alamat: {DESTINATION}

Terima kasih.',
        'Halo SiCepat 👋

Resi *{AWB}* gak gerak {DAYS} hari.
Tujuan: {DESTINATION}

Mohon dicek 🙏'
    ),
    (
        'anteraja',
        '021-50660033',
        'cs@anteraja.id',
        '6281190005005',
        'Yth. AnterAja,

Paket {AWB} tidak update {DAYS} hari.

Detail: {CUSTOMER_NAME} - {DESTINATION}

Mohon tindak lanjut.',
        'Halo AnterAja 👋

Paket *{AWB}* stuck {DAYS} hari ke {DESTINATION}.

Mohon bantuannya 🙏'
    ) ON CONFLICT DO NOTHING;
-- =============================================================================
-- 5. FUNCTION: Detect Stuck Packages (Run Daily via Cron)
-- =============================================================================
CREATE OR REPLACE FUNCTION detect_stuck_packages() RETURNS INTEGER AS $$
DECLARE v_count INTEGER := 0;
v_package RECORD;
v_days INTEGER;
v_severity VARCHAR;
v_alert_type VARCHAR;
BEGIN -- Find packages without update > 3 days
FOR v_package IN
SELECT *
FROM public.tracked_packages
WHERE is_active = true
    AND is_stuck = false
    AND is_resolved = false
    AND last_status_update < NOW() - INTERVAL '3 days'
    AND current_status NOT IN ('delivered', 'returned') LOOP -- Calculate days
    v_days := EXTRACT(
        DAY
        FROM NOW() - v_package.last_status_update
    )::INTEGER;
-- Determine severity
IF v_days >= 7 THEN v_severity := 'critical';
v_alert_type := 'stuck_7_days';
ELSIF v_days >= 5 THEN v_severity := 'danger';
v_alert_type := 'stuck_5_days';
ELSE v_severity := 'warning';
v_alert_type := 'stuck_3_days';
END IF;
-- Mark as stuck
UPDATE public.tracked_packages
SET is_stuck = true,
    stuck_detected_at = NOW(),
    days_without_update = v_days
WHERE id = v_package.id;
-- Create alert
INSERT INTO public.stuck_alerts (
        user_id,
        package_id,
        alert_type,
        severity,
        days_stuck,
        last_known_status
    )
VALUES (
        v_package.user_id,
        v_package.id,
        v_alert_type,
        v_severity,
        v_days,
        v_package.current_status
    );
v_count := v_count + 1;
END LOOP;
RETURN v_count;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 6. FUNCTION: Get Stuck Packages for User
-- =============================================================================
CREATE OR REPLACE FUNCTION get_stuck_packages(p_user_id UUID) RETURNS TABLE(
        package_id UUID,
        awb_number VARCHAR,
        courier VARCHAR,
        customer_name VARCHAR,
        destination VARCHAR,
        current_status VARCHAR,
        days_stuck INTEGER,
        severity VARCHAR,
        stuck_since TIMESTAMPTZ
    ) AS $$ BEGIN RETURN QUERY
SELECT tp.id,
    tp.awb_number,
    tp.courier,
    tp.customer_name,
    tp.destination,
    tp.current_status,
    tp.days_without_update,
    sa.severity,
    tp.stuck_detected_at
FROM public.tracked_packages tp
    JOIN public.stuck_alerts sa ON sa.package_id = tp.id
WHERE tp.user_id = p_user_id
    AND tp.is_stuck = true
    AND tp.is_resolved = false
ORDER BY tp.days_without_update DESC;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 7. FUNCTION: Get Complaint Template
-- =============================================================================
CREATE OR REPLACE FUNCTION get_complaint_template(
        p_courier VARCHAR,
        p_awb VARCHAR,
        p_customer_name VARCHAR,
        p_destination VARCHAR,
        p_days INTEGER,
        p_last_status VARCHAR,
        p_sender_name VARCHAR DEFAULT 'Seller'
    ) RETURNS TABLE(
        courier VARCHAR,
        cs_phone VARCHAR,
        cs_email VARCHAR,
        cs_whatsapp VARCHAR,
        email_message TEXT,
        whatsapp_message TEXT
    ) AS $$
DECLARE v_template RECORD;
v_email TEXT;
v_wa TEXT;
BEGIN
SELECT * INTO v_template
FROM public.complaint_templates
WHERE LOWER(complaint_templates.courier) = LOWER(p_courier)
    AND is_active = true
LIMIT 1;
IF NOT FOUND THEN RETURN;
END IF;
-- Replace placeholders in email
v_email := v_template.email_template;
v_email := replace(v_email, '{AWB}', p_awb);
v_email := replace(v_email, '{DAYS}', p_days::TEXT);
v_email := replace(
    v_email,
    '{CUSTOMER_NAME}',
    COALESCE(p_customer_name, 'Penerima')
);
v_email := replace(
    v_email,
    '{DESTINATION}',
    COALESCE(p_destination, '-')
);
v_email := replace(
    v_email,
    '{LAST_STATUS}',
    COALESCE(p_last_status, 'Unknown')
);
v_email := replace(v_email, '{SENDER_NAME}', p_sender_name);
-- Replace placeholders in WA
v_wa := v_template.whatsapp_template;
v_wa := replace(v_wa, '{AWB}', p_awb);
v_wa := replace(v_wa, '{DAYS}', p_days::TEXT);
v_wa := replace(
    v_wa,
    '{CUSTOMER_NAME}',
    COALESCE(p_customer_name, 'Penerima')
);
v_wa := replace(
    v_wa,
    '{DESTINATION}',
    COALESCE(p_destination, '-')
);
RETURN QUERY
SELECT v_template.courier,
    v_template.cs_phone,
    v_template.cs_email,
    v_template.cs_whatsapp,
    v_email,
    v_wa;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 8. RLS POLICIES
-- =============================================================================
ALTER TABLE public.tracked_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own packages" ON public.tracked_packages FOR ALL USING (auth.uid() = user_id);
ALTER TABLE public.stuck_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own alerts" ON public.stuck_alerts FOR
SELECT USING (auth.uid() = user_id);
ALTER TABLE public.complaint_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read complaint templates" ON public.complaint_templates FOR
SELECT USING (true);
-- =============================================================================
-- COMPLETION
-- =============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Stuck Package Detector created!';
RAISE NOTICE '🔍 Daily cron detection ready';
RAISE NOTICE '🚨 Alert system with severity levels';
RAISE NOTICE '📧 Complaint templates for JNE, J&T, SiCepat, AnterAja';
END $$;