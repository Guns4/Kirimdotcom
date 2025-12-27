-- Add ref code to profiles if not exists (assuming profiles table exists, otherwise creating separate)
CREATE TABLE IF NOT EXISTS user_referrals (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    referral_code TEXT NOT NULL UNIQUE,
    referred_by UUID REFERENCES auth.users(id),
    -- Who invited this user
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS referral_conversions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES auth.users(id),
    referee_id UUID REFERENCES auth.users(id),
    amount_paid NUMERIC,
    commission_earned NUMERIC,
    -- 20%
    status TEXT DEFAULT 'PAID',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own referral data" ON user_referrals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own conversions" ON referral_conversions FOR ALL USING (auth.uid() = referrer_id);