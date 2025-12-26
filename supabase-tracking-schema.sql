-- ============================================
-- TRACKING SUBSCRIPTIONS SCHEMA
-- ============================================
-- Run this in Supabase SQL Editor
-- Table for tracking subscriptions (auto-notify)
CREATE TABLE IF NOT EXISTS tracking_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    whatsapp VARCHAR(20),
    resi VARCHAR(100) NOT NULL,
    courier_code VARCHAR(20) NOT NULL,
    last_status VARCHAR(255),
    last_status_date TIMESTAMP WITH TIME ZONE,
    notification_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_delivered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure user provides at least email or whatsapp
    CONSTRAINT contact_required CHECK (
        email IS NOT NULL
        OR whatsapp IS NOT NULL
    )
);
-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tracking_subs_active ON tracking_subscriptions(is_active)
WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_tracking_subs_resi ON tracking_subscriptions(resi);
CREATE INDEX IF NOT EXISTS idx_tracking_subs_user ON tracking_subscriptions(user_id);
-- RLS Policies
ALTER TABLE tracking_subscriptions ENABLE ROW LEVEL SECURITY;
-- Users can view their own subscriptions
CREATE POLICY "Users can view own tracking subscriptions" ON tracking_subscriptions FOR
SELECT USING (auth.uid() = user_id);
-- Users can insert their own subscriptions
CREATE POLICY "Users can create tracking subscriptions" ON tracking_subscriptions FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own subscriptions
CREATE POLICY "Users can update own tracking subscriptions" ON tracking_subscriptions FOR
UPDATE USING (auth.uid() = user_id);
-- Users can delete their own subscriptions
CREATE POLICY "Users can delete own tracking subscriptions" ON tracking_subscriptions FOR DELETE USING (auth.uid() = user_id);
-- Service role can do everything (for Edge Functions)
CREATE POLICY "Service role full access" ON tracking_subscriptions FOR ALL USING (auth.role() = 'service_role');
-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_tracking_subscription_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER tracking_subscriptions_updated_at BEFORE
UPDATE ON tracking_subscriptions FOR EACH ROW EXECUTE FUNCTION update_tracking_subscription_timestamp();
-- ============================================
-- NOTIFICATION LOG (Optional - for debugging)
-- ============================================
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES tracking_subscriptions(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'whatsapp', 'push')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
    old_status VARCHAR(255),
    new_status VARCHAR(255),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sub ON notification_logs(subscription_id);