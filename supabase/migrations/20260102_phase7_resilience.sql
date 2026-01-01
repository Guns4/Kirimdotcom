-- ============================================
-- GOD MODE PHASE 7: RESILIENCE & SUPPORT
-- Support Tickets, Webhook Monitoring, Notifications
-- ============================================
-- SUPPORT TICKETS TABLE (Helpdesk System)
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'TECH' CHECK (
        category IN ('BILLING', 'TECH', 'BUG', 'FEATURE', 'OTHER')
    ),
    priority VARCHAR(20) DEFAULT 'LOW' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (
        status IN ('OPEN', 'ANSWERED', 'RESOLVED', 'CLOSED')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    closed_at TIMESTAMP WITH TIME ZONE
);
-- TICKET MESSAGES TABLE (Chat History)
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_role VARCHAR(10) CHECK (sender_role IN ('USER', 'ADMIN')),
    message TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- WEBHOOK ENDPOINTS TABLE (User-registered webhook URLs)
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    event_types TEXT [],
    -- ['order.created', 'shipment.updated']
    is_active BOOLEAN DEFAULT true,
    secret_key VARCHAR(255),
    -- For HMAC signature verification
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- WEBHOOK LOGS TABLE (Delivery Tracking)
CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    endpoint_id UUID REFERENCES public.webhook_endpoints(id) ON DELETE
    SET NULL,
        endpoint_url TEXT NOT NULL,
        event_type VARCHAR(50),
        payload JSONB,
        status_code INT,
        response_body TEXT,
        attempt_count INT DEFAULT 1,
        next_retry_at TIMESTAMP WITH TIME ZONE,
        delivered_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- ADMIN NOTIFICATIONS TABLE (Bell Alerts)
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(20) DEFAULT 'INFO' CHECK (type IN ('INFO', 'WARNING', 'CRITICAL')),
    message TEXT NOT NULL,
    link_action TEXT,
    -- URL to navigate when clicked
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_user ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON public.support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_user ON public.webhook_endpoints(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_user ON public.webhook_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON public.webhook_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created ON public.webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notif_read ON public.admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notif_created ON public.admin_notifications(created_at DESC);
-- Row Level Security
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
-- Policies
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR
SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR
INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view own webhooks" ON public.webhook_endpoints;
CREATE POLICY "Users can view own webhooks" ON public.webhook_endpoints FOR
SELECT USING (auth.uid() = user_id);
-- Function to create admin notification
CREATE OR REPLACE FUNCTION create_admin_notification(
        p_type TEXT,
        p_message TEXT,
        p_link TEXT DEFAULT NULL
    ) RETURNS UUID AS $$
DECLARE v_notif_id UUID;
BEGIN
INSERT INTO public.admin_notifications (type, message, link_action)
VALUES (p_type, p_message, p_link)
RETURNING id INTO v_notif_id;
RETURN v_notif_id;
END;
$$ LANGUAGE plpgsql;
-- Trigger to create notification when urgent ticket created
CREATE OR REPLACE FUNCTION notify_urgent_ticket() RETURNS TRIGGER AS $$ BEGIN IF NEW.priority = 'URGENT' THEN PERFORM create_admin_notification(
        'CRITICAL',
        'Urgent support ticket #' || NEW.id::text || ': ' || NEW.subject,
        '/admin/dashboard?tab=SUPPORT&ticket=' || NEW.id::text
    );
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_urgent_ticket ON public.support_tickets;
CREATE TRIGGER trigger_urgent_ticket
AFTER
INSERT ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION notify_urgent_ticket();
COMMENT ON TABLE public.support_tickets IS 'Customer support helpdesk tickets';
COMMENT ON TABLE public.ticket_messages IS 'Chat messages for support tickets';
COMMENT ON TABLE public.webhook_endpoints IS 'User-registered webhook endpoints for event notifications';
COMMENT ON TABLE public.webhook_logs IS 'Webhook delivery logs with retry tracking';
COMMENT ON TABLE public.admin_notifications IS 'Real-time notifications for admin dashboard';