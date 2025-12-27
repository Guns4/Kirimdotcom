CREATE TABLE IF NOT EXISTS user_webhooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    event_type TEXT NOT NULL,
    -- 'ORDER_CREATED', 'TRACKING_UPDATED', 'PACKAGE_DELIVERED'
    secret TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_id UUID REFERENCES user_webhooks(id) ON DELETE CASCADE,
    payload JSONB,
    response_status INTEGER,
    response_body TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own webhooks" ON user_webhooks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own logs" ON webhook_logs FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM user_webhooks
            WHERE id = webhook_id
                AND user_id = auth.uid()
        )
    );