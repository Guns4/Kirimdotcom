-- Mission Configurations (Templates)
CREATE TABLE IF NOT EXISTS public.daily_missions_config (
    id SERIAL PRIMARY KEY,
    task_type VARCHAR NOT NULL, -- 'LOGIN', 'CEK_RESI', 'TOPUP', 'SHARE', 'OPTIMIZE', 'REFERRAL', 'BULK_LABEL'
    difficulty VARCHAR NOT NULL, -- 'EASY', 'MEDIUM', 'HARD'
    xp_reward INTEGER NOT NULL,
    title VARCHAR NOT NULL,
    description VARCHAR NOT NULL,
    target_count INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true 
);

-- User Mission Progress
CREATE TABLE IF NOT EXISTS public.user_daily_missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    config_id INTEGER REFERENCES public.daily_missions_config(id),
    date DATE DEFAULT CURRENT_DATE,
    progress INTEGER DEFAULT 0,
    is_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.daily_missions_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "everyone read config" ON public.daily_missions_config FOR SELECT USING (true);
CREATE POLICY "users manage own missions" ON public.user_daily_missions 
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Seed Default Missions
INSERT INTO public.daily_missions_config (task_type, difficulty, xp_reward, title, description, target_count) VALUES
('LOGIN', 'EASY', 5, 'Login Harian', 'Masuk ke aplikasi hari ini', 1),
('CEK_RESI', 'EASY', 20, 'Cek 1 Resi', 'Lacak kiriman paketmu', 1),
('CEK_RESI', 'MEDIUM', 50, 'Rajin Tracking', 'Lacak 5 paket berbeda', 5),
('TOPUP', 'MEDIUM', 50, 'Topup Saldo', 'Isi saldo minimal Rp 50.000', 1),
('SHARE', 'EASY', 30, 'Share ke WA', 'Bagikan status paket ke WhatsApp', 1),
('OPTIMIZE', 'MEDIUM', 40, 'Cek Ongkir', 'Cek harga pengiriman 3x', 3),
('REFERRAL', 'HARD', 200, 'Ajak Teman', 'Undang 1 teman baru', 1),
('BULK_LABEL', 'HARD', 100, 'Cetak Label', 'Print 5 label sekaligus', 5);
