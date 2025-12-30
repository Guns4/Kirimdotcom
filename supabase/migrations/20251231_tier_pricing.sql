-- Tier Pricing Schema
-- Account levels for wholesale pricing

-- Add account_level to profiles if it doesn't exist
-- Note: We assume a 'profiles' or similar table exists for user data.
-- Since the user didn't provide the exact profile schema, we'll create a new table
-- specifically for tier status that references auth.users

CREATE TABLE IF NOT EXISTS user_tiers (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    account_level TEXT DEFAULT 'BASIC', -- BASIC, RESELLER, VIP
    
    -- Expiry (optional, e.g. for subscription-based VIP)
    valid_until TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Upgrade History
CREATE TABLE IF NOT EXISTS tier_upgrades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    from_level TEXT NOT NULL,
    to_level TEXT NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_upgrades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tier" ON user_tiers
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their upgrade history" ON tier_upgrades
FOR SELECT USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_user_tiers_level ON user_tiers(account_level);
