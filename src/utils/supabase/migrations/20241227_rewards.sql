CREATE TABLE IF NOT EXISTS rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    cost_points INTEGER NOT NULL,
    reward_type TEXT NOT NULL, -- 'VOUCHER', 'DIGITAL_PRODUCT', 'PREMIUM_ACCESS'
    reward_value TEXT, -- The code, link, or duration
    image_url TEXT,
    stock INTEGER DEFAULT 999,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_id UUID REFERENCES rewards(id),
    redeemed_code TEXT,
    status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'USED', 'EXPIRED'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read rewards" ON rewards FOR SELECT USING (true);
CREATE POLICY "Users manage own rewards" ON user_rewards FOR ALL USING (auth.uid() = user_id);

-- Seed some Data
INSERT INTO rewards (title, description, cost_points, reward_type, reward_value) VALUES
('Voucher Ongkir 10rb', 'Potongan ongkir untuk pengiriman via JNE/JNT.', 100, 'VOUCHER', 'ONGKIR10K'),
('Ebook: Cara Jualan Laris', 'Panduan lengkap marketing online untuk pemula.', 500, 'DIGITAL_PRODUCT', 'https://cekkirim.com/dl/ebook-jualan.pdf'),
('CekKirim Premium 7 Hari', 'Akses fitur premium tanpa iklan selama seminggu.', 200, 'PREMIUM_ACCESS', '7_DAYS');
