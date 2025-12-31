-- WhatsApp Broadcast System Schema

-- Contact lists
CREATE TABLE IF NOT EXISTS public.broadcast_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT,
    phone_number TEXT NOT NULL,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Broadcast campaigns
CREATE TABLE IF NOT EXISTS public.broadcast_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'DRAFT', -- DRAFT, QUEUED, RUNNING, COMPLETED, FAILED
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Message queue
CREATE TABLE IF NOT EXISTS public.broadcast_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.broadcast_campaigns(id) NOT NULL,
    contact_id UUID REFERENCES public.broadcast_contacts(id) NOT NULL,
    phone_number TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING', -- PENDING, SENT, FAILED
    send_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Broadcast quota tracking
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS broadcast_quota INTEGER DEFAULT 0;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_broadcast_contacts_user ON public.broadcast_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_campaigns_user ON public.broadcast_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_queue_status ON public.broadcast_queue(status, send_at);

-- RLS
ALTER TABLE public.broadcast_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own contacts" ON public.broadcast_contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own campaigns" ON public.broadcast_campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own queue" ON public.broadcast_queue FOR SELECT USING (
    campaign_id IN (SELECT id FROM public.broadcast_campaigns WHERE user_id = auth.uid())
);
