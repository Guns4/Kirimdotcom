-- ============================================
-- MONETIZATION SCHEMA FOR CEKKIRIM
-- ============================================
-- Table: subscriptions, transactions, affiliate_clicks
-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- User reference
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Plan details
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('monthly', 'yearly', 'lifetime')),
    plan_name VARCHAR(50) DEFAULT 'Pro',
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'active', 'expired', 'cancelled')
    ),
    -- Dates
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    -- Payment reference
    payment_gateway VARCHAR(50),
    -- 'midtrans', 'xendit', 'lemonsqueezy', 'manual'
    external_subscription_id VARCHAR(100),
    last_payment_id VARCHAR(100),
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
-- ============================================
-- TRANSACTIONS TABLE (Payment History)
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- References
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE
    SET NULL,
        -- Transaction details
        amount INTEGER NOT NULL,
        -- in IDR (smallest unit)
        currency VARCHAR(3) DEFAULT 'IDR',
        -- Payment gateway info
        payment_gateway VARCHAR(50) NOT NULL,
        external_transaction_id VARCHAR(100),
        payment_method VARCHAR(50),
        -- 'bank_transfer', 'ewallet', 'credit_card', etc.
        -- Status
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
            status IN ('pending', 'success', 'failed', 'refunded')
        ),
        -- Metadata
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_external_id ON transactions(external_transaction_id);
-- ============================================
-- AFFILIATE CLICKS TABLE (Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- User info
    user_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        session_id VARCHAR(100),
        -- Affiliate info
        courier_code VARCHAR(20) NOT NULL,
        affiliate_type VARCHAR(50),
        -- 'courier_official', 'marketplace', 'ads'
        destination_url TEXT NOT NULL,
        -- Tracking
        referrer TEXT,
        user_agent TEXT,
        ip_hash VARCHAR(64),
        -- Hashed for privacy
        -- Metadata
        clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Indexes
CREATE INDEX idx_affiliate_clicks_courier ON affiliate_clicks(courier_code);
CREATE INDEX idx_affiliate_clicks_date ON affiliate_clicks(clicked_at);
-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
-- Subscriptions: Users can only read their own
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR
SELECT USING (auth.uid() = user_id);
-- Transactions: Users can only read their own
CREATE POLICY "Users can view own transactions" ON transactions FOR
SELECT USING (auth.uid() = user_id);
-- Affiliate clicks: Insert only (tracking)
CREATE POLICY "Anyone can insert affiliate clicks" ON affiliate_clicks FOR
INSERT WITH CHECK (true);
-- Service role can do everything (for webhooks)
CREATE POLICY "Service role full access subscriptions" ON subscriptions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access transactions" ON transactions FOR ALL USING (auth.role() = 'service_role');
-- ============================================
-- HELPER FUNCTIONS
-- ============================================
-- Function: Check if user has active subscription
CREATE OR REPLACE FUNCTION is_user_premium(target_user_id UUID) RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (
        SELECT 1
        FROM subscriptions
        WHERE user_id = target_user_id
            AND status = 'active'
            AND (
                end_date IS NULL
                OR end_date > NOW()
            )
    );
END;
$$ LANGUAGE plpgsql;
-- Function: Get user's current subscription
CREATE OR REPLACE FUNCTION get_user_subscription(target_user_id UUID) RETURNS TABLE (
        subscription_id UUID,
        plan_type VARCHAR,
        plan_name VARCHAR,
        status VARCHAR,
        start_date TIMESTAMP WITH TIME ZONE,
        end_date TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN
    ) AS $$ BEGIN RETURN QUERY
SELECT s.id as subscription_id,
    s.plan_type,
    s.plan_name,
    s.status,
    s.start_date,
    s.end_date,
    (
        s.status = 'active'
        AND (
            s.end_date IS NULL
            OR s.end_date > NOW()
        )
    ) as is_active
FROM subscriptions s
WHERE s.user_id = target_user_id
ORDER BY s.created_at DESC
LIMIT 1;
END;
$$ LANGUAGE plpgsql;
-- Trigger: Update updated_at on change
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER subscriptions_updated_at BEFORE
UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER transactions_updated_at BEFORE
UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();