CREATE TABLE IF NOT EXISTS user_points (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    total_points INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    tier_level TEXT DEFAULT 'BRONZE', -- BRONZE, SILVER, GOLD, PLATINUM
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS point_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Positive for earn, negative for spend
    transaction_type TEXT NOT NULL, -- 'EARN_TRACKING', 'EARN_ORDER', 'REDEEM_REWARD', 'BONUS'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own points" ON user_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own history" ON point_history FOR SELECT USING (auth.uid() = user_id);
