-- Logistics Tycoon Game Schema
-- Retention Gamification System

-- User Tycoon Profile
CREATE TABLE IF NOT EXISTS tycoon_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Level & XP
    current_level INT DEFAULT 1,
    current_xp INT DEFAULT 0,
    total_xp INT DEFAULT 0,
    
    -- Stats
    total_shipments INT DEFAULT 0,
    total_spent DECIMAL(15,2) DEFAULT 0,
    total_savings DECIMAL(15,2) DEFAULT 0,
    
    -- Unlocked Items
    unlocked_skins TEXT[] DEFAULT '{}',
    active_skin TEXT DEFAULT 'default',
    
    -- Benefits
    admin_fee_discount DECIMAL(5,2) DEFAULT 0, -- Percentage discount
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unlockable Items Registry
CREATE TABLE IF NOT EXISTS tycoon_unlockables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unlock_type TEXT NOT NULL, -- 'SKIN', 'DISCOUNT', 'BADGE'
    unlock_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    required_level INT NOT NULL,
    benefit_value DECIMAL(5,2), -- For discounts
    image_url TEXT,
    rarity TEXT DEFAULT 'COMMON', -- COMMON, RARE, EPIC, LEGENDARY
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- XP History
CREATE TABLE IF NOT EXISTS tycoon_xp_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    xp_amount INT NOT NULL,
    source TEXT NOT NULL, -- 'SHIPMENT', 'OPTIMIZATION', 'REFERRAL', 'DAILY_LOGIN'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE tycoon_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tycoon_unlockables ENABLE ROW LEVEL SECURITY;
ALTER TABLE tycoon_xp_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tycoon profile"
ON tycoon_profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tycoon profile"
ON tycoon_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view unlockables"
ON tycoon_unlockables FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view their own XP logs"
ON tycoon_xp_logs FOR SELECT USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_tycoon_profiles_user_id ON tycoon_profiles(user_id);
CREATE INDEX idx_tycoon_profiles_level ON tycoon_profiles(current_level DESC);
CREATE INDEX idx_tycoon_xp_logs_user_id ON tycoon_xp_logs(user_id);

-- Seed Default Unlockables
INSERT INTO tycoon_unlockables (unlock_type, unlock_id, name, description, required_level, benefit_value, rarity) VALUES
-- Truck Skins
('SKIN', 'truck_default', 'Truk Standar', 'Truk pengiriman standar', 1, NULL, 'COMMON'),
('SKIN', 'truck_blue', 'Truk Biru', 'Truk warna biru keren', 2, NULL, 'COMMON'),
('SKIN', 'truck_gold', 'Truk Emas', 'Truk premium warna emas', 5, NULL, 'RARE'),
('SKIN', 'truck_diamond', 'Truk Berlian', 'Truk edisi terbatas', 8, NULL, 'EPIC'),
('SKIN', 'truck_legendary', 'Truk Legenda', 'Truk sultan sejati', 10, NULL, 'LEGENDARY'),
-- Discounts
('DISCOUNT', 'discount_5', 'Diskon 5%', 'Potongan admin fee 5%', 3, 5, 'COMMON'),
('DISCOUNT', 'discount_10', 'Diskon 10%', 'Potongan admin fee 10%', 6, 10, 'RARE'),
('DISCOUNT', 'discount_15', 'Diskon 15%', 'Potongan admin fee 15%', 9, 15, 'EPIC'),
('DISCOUNT', 'discount_max', 'FREE Admin!', 'Bebas biaya admin selamanya', 10, 100, 'LEGENDARY')
ON CONFLICT (unlock_id) DO NOTHING;
