-- =============================================================================
-- WA GATEWAY NOTIFICATION SYSTEM
-- Phase 431-435: Automated WhatsApp Notifications
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =============================================================================
-- 1. WA PROVIDER CONFIG TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.wa_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Provider info
    provider_name VARCHAR(50) NOT NULL,
    -- 'fonnte', 'watzap', 'wablas'
    api_url TEXT NOT NULL,
    api_key TEXT NOT NULL,
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 2. USER WA SETTINGS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.wa_user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- User
    user_id UUID NOT NULL UNIQUE,
    -- WA Config
    wa_api_key TEXT,
    -- User's API key from provider
    wa_provider VARCHAR(50) DEFAULT 'fonnte',
    wa_sender_number VARCHAR(20),
    -- Auto-notification toggles
    notify_on_delivered BOOLEAN DEFAULT true,
    notify_on_retur BOOLEAN DEFAULT true,
    notify_on_pickup BOOLEAN DEFAULT false,
    notify_on_transit BOOLEAN DEFAULT false,
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wa_settings_user ON public.wa_user_settings(user_id);
-- =============================================================================
-- 3. WA MESSAGE TEMPLATES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.wa_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- User
    user_id UUID NOT NULL,
    -- Template info
    template_name VARCHAR(100) NOT NULL,
    trigger_event VARCHAR(50) NOT NULL,
    -- 'delivered', 'retur', 'pickup', 'transit'
    recipient_type VARCHAR(20) DEFAULT 'buyer',
    -- 'buyer', 'seller'
    -- Message content (with placeholders)
    message_template TEXT NOT NULL,
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, trigger_event, recipient_type)
);
CREATE INDEX IF NOT EXISTS idx_wa_templates_user ON public.wa_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_wa_templates_trigger ON public.wa_templates(trigger_event);
-- =============================================================================
-- 4. WA NOTIFICATION LOG TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.wa_notification_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- User
    user_id UUID NOT NULL,
    -- Notification details
    recipient_phone VARCHAR(20) NOT NULL,
    recipient_type VARCHAR(20) NOT NULL,
    -- 'buyer', 'seller'
    trigger_event VARCHAR(50) NOT NULL,
    -- Message
    message_sent TEXT NOT NULL,
    -- Reference
    awb_number VARCHAR(50),
    order_id UUID,
    -- Provider response
    provider_response JSONB,
    message_id VARCHAR(100),
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'sent', 'delivered', 'failed'
    error_message TEXT,
    -- Cost
    cost DECIMAL(10, 2) DEFAULT 0,
    -- Timestamps
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_wa_log_user ON public.wa_notification_log(user_id);
CREATE INDEX IF NOT EXISTS idx_wa_log_status ON public.wa_notification_log(status);
CREATE INDEX IF NOT EXISTS idx_wa_log_date ON public.wa_notification_log(sent_at DESC);
-- =============================================================================
-- 5. DEFAULT TEMPLATES (Indonesian)
-- =============================================================================
CREATE OR REPLACE FUNCTION create_default_wa_templates(p_user_id UUID) RETURNS VOID AS $$ BEGIN -- Delivered notification for buyer
INSERT INTO public.wa_templates (
        user_id,
        template_name,
        trigger_event,
        recipient_type,
        message_template
    )
VALUES (
        p_user_id,
        'Paket Diterima',
        'delivered',
        'buyer',
        'Halo Kak {CUSTOMER_NAME} 👋

Paket dengan nomor resi *{AWB}* sudah sampai ya! 📦✅

Terima kasih sudah berbelanja di toko kami 🙏
Jangan lupa kasih bintang 5 ya kak ⭐⭐⭐⭐⭐

Salam,
{SHOP_NAME}'
    ) ON CONFLICT (user_id, trigger_event, recipient_type) DO NOTHING;
-- Retur notification for seller
INSERT INTO public.wa_templates (
        user_id,
        template_name,
        trigger_event,
        recipient_type,
        message_template
    )
VALUES (
        p_user_id,
        'Paket Retur',
        'retur',
        'seller',
        '⚠️ ALERT: PAKET RETUR ⚠️

Resi: *{AWB}*
Customer: {CUSTOMER_NAME}
Telepon: {CUSTOMER_PHONE}

Status: Paket diretur/dikembalikan!

Segera cek dan follow up customer ya!'
    ) ON CONFLICT (user_id, trigger_event, recipient_type) DO NOTHING;
-- Pickup notification for buyer
INSERT INTO public.wa_templates (
        user_id,
        template_name,
        trigger_event,
        recipient_type,
        message_template
    )
VALUES (
        p_user_id,
        'Paket Dijemput',
        'pickup',
        'buyer',
        'Halo Kak {CUSTOMER_NAME} 👋

Pesanan kamu sudah dijemput kurir! 🚚
Resi: *{AWB}*

Estimasi sampai: {ESTIMATED_DAYS} hari kerja

Kamu bisa tracking di: cekkirim.com

Salam,
{SHOP_NAME}'
    ) ON CONFLICT (user_id, trigger_event, recipient_type) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 6. FUNCTION: Send WA Notification
-- =============================================================================
CREATE OR REPLACE FUNCTION queue_wa_notification(
        p_user_id UUID,
        p_recipient_phone VARCHAR,
        p_recipient_type VARCHAR,
        p_trigger_event VARCHAR,
        p_awb VARCHAR,
        p_variables JSONB
    ) RETURNS UUID AS $$
DECLARE v_template RECORD;
v_settings RECORD;
v_message TEXT;
v_log_id UUID;
BEGIN -- Get user settings
SELECT * INTO v_settings
FROM public.wa_user_settings
WHERE user_id = p_user_id
    AND is_active = true;
IF NOT FOUND THEN RETURN NULL;
END IF;
-- Get template
SELECT * INTO v_template
FROM public.wa_templates
WHERE user_id = p_user_id
    AND trigger_event = p_trigger_event
    AND recipient_type = p_recipient_type
    AND is_active = true;
IF NOT FOUND THEN RETURN NULL;
END IF;
-- Build message from template
v_message := v_template.message_template;
v_message := replace(v_message, '{AWB}', p_awb);
v_message := replace(
    v_message,
    '{CUSTOMER_NAME}',
    COALESCE(p_variables->>'customer_name', 'Pelanggan')
);
v_message := replace(
    v_message,
    '{CUSTOMER_PHONE}',
    COALESCE(
        p_variables->>'customer_phone',
        p_recipient_phone
    )
);
v_message := replace(
    v_message,
    '{SHOP_NAME}',
    COALESCE(p_variables->>'shop_name', 'Toko Kami')
);
v_message := replace(
    v_message,
    '{ESTIMATED_DAYS}',
    COALESCE(p_variables->>'estimated_days', '2-3')
);
-- Log notification
INSERT INTO public.wa_notification_log (
        user_id,
        recipient_phone,
        recipient_type,
        trigger_event,
        message_sent,
        awb_number,
        status
    )
VALUES (
        p_user_id,
        p_recipient_phone,
        p_recipient_type,
        p_trigger_event,
        v_message,
        p_awb,
        'pending'
    )
RETURNING id INTO v_log_id;
RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 7. RLS POLICIES
-- =============================================================================
ALTER TABLE public.wa_user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own WA settings" ON public.wa_user_settings FOR ALL USING (auth.uid() = user_id);
ALTER TABLE public.wa_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own templates" ON public.wa_templates FOR ALL USING (auth.uid() = user_id);
ALTER TABLE public.wa_notification_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notification logs" ON public.wa_notification_log FOR
SELECT USING (auth.uid() = user_id);
-- =============================================================================
-- COMPLETION
-- =============================================================================
DO $$ BEGIN RAISE NOTICE '✅ WA Gateway System created!';
RAISE NOTICE '📱 WhatsApp notification automation ready';
RAISE NOTICE '📝 Editable message templates';
RAISE NOTICE '🔔 Auto-trigger on status changes';
RAISE NOTICE '📊 Notification history logging';
END $$;