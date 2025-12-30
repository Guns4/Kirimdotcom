-- WA Bot Subscriptions Schema
-- Billing for Bot Premium features

CREATE TABLE IF NOT EXISTS wa_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Plan Details
    plan TEXT NOT NULL DEFAULT 'FREE', -- FREE, BASIC, PREMIUM, ENTERPRISE
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, CANCELLED, EXPIRED
    
    -- Features
    auto_reply_enabled BOOLEAN DEFAULT FALSE,
    broadcast_enabled BOOLEAN DEFAULT FALSE,
    analytics_enabled BOOLEAN DEFAULT FALSE,
    
    -- Quotas
    daily_auto_reply_quota INT DEFAULT 0,
    monthly_broadcast_quota INT DEFAULT 0,
    
    -- Billing
    price_monthly DECIMAL(10,2) DEFAULT 0,
    next_billing_date DATE,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage Tracking
CREATE TABLE IF NOT EXISTS wa_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    usage_date DATE DEFAULT CURRENT_DATE,
    
    auto_reply_count INT DEFAULT 0,
    messages_received INT DEFAULT 0,
    messages_sent INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-Reply Logs
CREATE TABLE IF NOT EXISTS wa_autoreply_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT REFERENCES wa_sessions(session_id) ON DELETE CASCADE,
    
    from_number TEXT NOT NULL,
    detected_resi TEXT,
    detected_courier TEXT,
    reply_sent BOOLEAN DEFAULT FALSE,
    reply_text TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE wa_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_autoreply_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
ON wa_subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own usage"
ON wa_usage FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own autoreply logs"
ON wa_autoreply_logs FOR SELECT 
USING (session_id IN (SELECT session_id FROM wa_sessions WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX idx_wa_subscriptions_user ON wa_subscriptions(user_id);
CREATE INDEX idx_wa_usage_user_date ON wa_usage(user_id, usage_date);
CREATE INDEX idx_wa_autoreply_logs_session ON wa_autoreply_logs(session_id, created_at DESC);

-- Seed Default Plans Info (for reference)
COMMENT ON TABLE wa_subscriptions IS '
Plan Details:
- FREE: 0 auto-reply, 0 broadcast
- BASIC: 100/day auto-reply, 500/mo broadcast, Rp 50k/mo
- PREMIUM: 1000/day auto-reply, 5000/mo broadcast, Rp 150k/mo
- ENTERPRISE: Unlimited, Rp 500k/mo
';
