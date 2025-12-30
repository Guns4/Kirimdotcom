-- Daily Mission System Schema
-- DAU Improvement - Missions reset at 00:00 daily

-- Mission Templates (Master data)
CREATE TABLE IF NOT EXISTS mission_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_type TEXT NOT NULL, -- 'CEK_RESI', 'TOPUP', 'SHARE', 'LOGIN', etc.
    title TEXT NOT NULL,
    description TEXT,
    target_count INT DEFAULT 1, -- How many times to complete
    xp_reward INT NOT NULL,
    coin_reward INT DEFAULT 0,
    difficulty TEXT DEFAULT 'EASY', -- EASY, MEDIUM, HARD
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Daily Missions (Reset daily)
CREATE TABLE IF NOT EXISTS daily_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_template_id UUID REFERENCES mission_templates(id),
    
    -- Progress
    current_progress INT DEFAULT 0,
    target_count INT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    is_claimed BOOLEAN DEFAULT FALSE,
    
    -- Rewards
    xp_reward INT NOT NULL,
    coin_reward INT DEFAULT 0,
    
    -- Date tracking
    mission_date DATE DEFAULT CURRENT_DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mission Event Logs (for tracking)
CREATE TABLE IF NOT EXISTS mission_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'CEK_RESI', 'TOPUP', 'SHARE', etc.
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE mission_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view mission templates"
ON mission_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view their own daily missions"
ON daily_missions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily missions"
ON daily_missions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own mission events"
ON mission_events FOR SELECT USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_daily_missions_user_date ON daily_missions(user_id, mission_date);
CREATE INDEX idx_daily_missions_date ON daily_missions(mission_date);
CREATE INDEX idx_mission_events_user ON mission_events(user_id, created_at DESC);

-- Seed Mission Templates
INSERT INTO mission_templates (mission_type, title, description, target_count, xp_reward, coin_reward, difficulty) VALUES
('LOGIN', 'Login Hari Ini', 'Masuk ke akun CekKirim', 1, 5, 10, 'EASY'),
('CEK_RESI', 'Cek 3 Resi', 'Tracking 3 nomor resi berbeda', 3, 20, 30, 'EASY'),
('CEK_RESI', 'Cek 10 Resi', 'Tracking 10 nomor resi berbeda', 10, 50, 75, 'MEDIUM'),
('TOPUP', 'Topup Saldo Rp 50rb', 'Isi saldo minimal Rp 50.000', 1, 50, 100, 'MEDIUM'),
('TOPUP', 'Topup Saldo Rp 100rb', 'Isi saldo minimal Rp 100.000', 1, 100, 200, 'HARD'),
('SHARE', 'Share ke WhatsApp', 'Bagikan hasil tracking ke WA', 1, 30, 50, 'EASY'),
('SHARE', 'Share 5 Kali', 'Bagikan hasil tracking 5 kali', 5, 80, 120, 'MEDIUM'),
('OPTIMIZE', 'Optimasi Rute', 'Gunakan fitur route optimizer', 1, 40, 60, 'MEDIUM'),
('REFERRAL', 'Ajak Teman', 'Undang 1 teman baru', 1, 200, 500, 'HARD'),
('BULK_LABEL', 'Generate Label', 'Buat label massal', 1, 30, 50, 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Function to generate daily missions for a user
CREATE OR REPLACE FUNCTION generate_daily_missions(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_template RECORD;
BEGIN
    -- Check if missions already generated for today
    IF EXISTS (SELECT 1 FROM daily_missions WHERE user_id = p_user_id AND mission_date = v_today) THEN
        RETURN;
    END IF;
    
    -- Generate 4 random missions (1 EASY, 2 MEDIUM, 1 optional HARD)
    FOR v_template IN 
        SELECT * FROM mission_templates 
        WHERE is_active = TRUE AND difficulty = 'EASY'
        ORDER BY RANDOM() LIMIT 1
    LOOP
        INSERT INTO daily_missions (user_id, mission_template_id, target_count, xp_reward, coin_reward, mission_date)
        VALUES (p_user_id, v_template.id, v_template.target_count, v_template.xp_reward, v_template.coin_reward, v_today);
    END LOOP;
    
    FOR v_template IN 
        SELECT * FROM mission_templates 
        WHERE is_active = TRUE AND difficulty = 'MEDIUM'
        ORDER BY RANDOM() LIMIT 2
    LOOP
        INSERT INTO daily_missions (user_id, mission_template_id, target_count, xp_reward, coin_reward, mission_date)
        VALUES (p_user_id, v_template.id, v_template.target_count, v_template.xp_reward, v_template.coin_reward, v_today);
    END LOOP;
    
    FOR v_template IN 
        SELECT * FROM mission_templates 
        WHERE is_active = TRUE AND difficulty = 'HARD'
        ORDER BY RANDOM() LIMIT 1
    LOOP
        INSERT INTO daily_missions (user_id, mission_template_id, target_count, xp_reward, coin_reward, mission_date)
        VALUES (p_user_id, v_template.id, v_template.target_count, v_template.xp_reward, v_template.coin_reward, v_today);
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
