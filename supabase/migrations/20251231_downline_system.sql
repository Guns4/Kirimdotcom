-- Downline System Schema
-- Referral hierarchy and commission tracking

-- User Relations (Hierarchy)
CREATE TABLE IF NOT EXISTS user_relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uplne_id UUID REFERENCES auth.users(id),
    downline_id UUID REFERENCES auth.users(id) UNIQUE, -- One upline per user
    
    referral_code_used TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT no_self_referral CHECK (uplne_id != downline_id)
);

-- Referral Codes
CREATE TABLE IF NOT EXISTS referral_codes (
    code TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Commissions
CREATE TABLE IF NOT EXISTS commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upline_id UUID REFERENCES auth.users(id),
    downline_id UUID REFERENCES auth.users(id),
    
    transaction_ref_id TEXT NOT NULL, -- Reference to the original transaction
    amount DECIMAL(10,2) NOT NULL DEFAULT 25,
    
    status TEXT DEFAULT 'PAID', -- PAID, PENDING, REVOKED
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their downlines" ON user_relations
FOR SELECT USING (auth.uid() = uplne_id);

CREATE POLICY "Users see their referral code" ON referral_codes
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users see their earned commissions" ON commissions
FOR SELECT USING (auth.uid() = uplne_id);

-- Indexes
CREATE INDEX idx_user_relations_upline ON user_relations(uplne_id);
CREATE INDEX idx_commissions_upline_date ON commissions(upline_id, created_at DESC);
