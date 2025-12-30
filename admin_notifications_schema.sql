-- Table: Admin Notifications
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL, -- INFO, WARNING, CRITICAL, SUCCESS
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;

-- Index for fast retrieval of unread
CREATE INDEX IF NOT EXISTS idx_admin_notif_unread ON public.admin_notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_admin_notif_created ON public.admin_notifications(created_at DESC);
