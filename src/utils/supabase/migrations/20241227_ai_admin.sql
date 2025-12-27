-- =============================================================================
-- AI ADMIN SYSTEM
-- Phase 496-500: Full Automation for Solo Admin
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =============================================================================
-- 1. FAQ KNOWLEDGE BASE (Skip if exists from main schema)
-- =============================================================================
-- Use DO block to check if table exists
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'faq_items'
) THEN CREATE TABLE public.faq_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keywords TEXT [] NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    link_url TEXT,
    link_text VARCHAR(100),
    category VARCHAR(50),
    priority INTEGER DEFAULT 0,
    times_shown INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_faq_keywords ON public.faq_items USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_faq_category ON public.faq_items(category);
-- Seed FAQ data (use ON CONFLICT DO NOTHING)
INSERT INTO public.faq_items (
        keywords,
        question,
        answer,
        link_url,
        category,
        priority
    )
VALUES (
        ARRAY ['cek', 'resi', 'lacak', 'tracking', 'paket'],
        'Bagaimana cara cek resi?',
        'Untuk cek resi, masukkan nomor resi di halaman utama lalu klik tombol "Lacak". Sistem akan otomatis menampilkan status terbaru paket Anda.',
        '/tutorial/cek-resi',
        'tracking',
        10
    ),
    (
        ARRAY ['ongkir', 'ongkos', 'kirim', 'biaya', 'tarif', 'harga'],
        'Bagaimana cara cek ongkir?',
        'Kunjungi halaman Cek Ongkir, masukkan kota asal dan tujuan, lalu pilih kurir. Harga akan muncul otomatis.',
        '/cek-ongkir',
        'shipping',
        10
    ),
    (
        ARRAY ['daftar', 'register', 'akun', 'buat'],
        'Bagaimana cara daftar akun?',
        'Klik tombol "Daftar" di pojok kanan atas, masukkan email dan password, lalu verifikasi email Anda.',
        '/auth/register',
        'account',
        8
    ),
    (
        ARRAY ['lupa', 'password', 'reset', 'kata sandi'],
        'Lupa password, bagaimana cara reset?',
        'Klik "Lupa Password" di halaman login, masukkan email Anda, lalu cek inbox untuk link reset password.',
        '/auth/forgot-password',
        'account',
        9
    ),
    (
        ARRAY ['wallet', 'saldo', 'deposit', 'isi', 'topup'],
        'Bagaimana cara isi saldo wallet?',
        'Masuk ke Dashboard > Wallet > Isi Saldo. Pilih nominal dan metode pembayaran, lalu selesaikan pembayaran.',
        '/dashboard/wallet',
        'payment',
        8
    ),
    (
        ARRAY ['kurir', 'lokal', 'antar', 'jemput'],
        'Bagaimana cara pesan kurir lokal?',
        'Buka halaman Kurir Lokal, pilih kecamatan Anda, lalu klik "Pesan" pada kurir yang tersedia.',
        '/kurir-lokal',
        'courier',
        7
    ),
    (
        ARRAY ['rekber', 'escrow', 'cod', 'bayar'],
        'Apa itu Rekber?',
        'Rekber (Rekening Bersama) adalah fitur untuk transaksi aman. Uang ditahan CekKirim sampai barang diterima.',
        '/tutorial/rekber',
        'payment',
        7
    ),
    (
        ARRAY ['contact', 'hubungi', 'admin', 'cs', 'layanan'],
        'Bagaimana cara menghubungi admin?',
        'Anda bisa menghubungi kami via email di support@cekkirim.com atau WhatsApp di 0812-xxxx-xxxx.',
        '/contact',
        'support',
        6
    ) ON CONFLICT DO NOTHING;
-- =============================================================================
-- 2. SUPPORT TICKETS (Skip if exists from main schema)
-- =============================================================================
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'support_tickets'
) THEN CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    category VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    attachments TEXT [],
    priority VARCHAR(20) DEFAULT 'normal',
    ticket_status VARCHAR(20) DEFAULT 'open',
    auto_reply_sent BOOLEAN DEFAULT false,
    auto_reply_at TIMESTAMPTZ,
    assigned_to UUID,
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_status ON public.support_tickets(ticket_status);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_email ON public.support_tickets(email);
-- =============================================================================
-- 3. SYSTEM HEALTH LOGS (Skip if exists)
-- =============================================================================
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'system_health_logs'
) THEN CREATE TABLE public.system_health_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_type VARCHAR(50) NOT NULL,
    target_url TEXT,
    target_name VARCHAR(100),
    is_healthy BOOLEAN NOT NULL,
    response_time_ms INTEGER,
    status_code INTEGER,
    error_message TEXT,
    alert_sent BOOLEAN DEFAULT false,
    alert_sent_at TIMESTAMPTZ,
    checked_at TIMESTAMPTZ DEFAULT NOW()
);
END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_health_type ON public.system_health_logs(check_type);
CREATE INDEX IF NOT EXISTS idx_health_healthy ON public.system_health_logs(is_healthy);
CREATE INDEX IF NOT EXISTS idx_health_date ON public.system_health_logs(checked_at DESC);
-- =============================================================================
-- 4. ADMIN NOTIFICATION SETTINGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.admin_notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel VARCHAR(50) NOT NULL,
    config JSONB NOT NULL,
    notify_on TEXT [],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 5. FUNCTION: Search FAQ
-- =============================================================================
CREATE OR REPLACE FUNCTION search_faq(p_query TEXT) RETURNS TABLE(
        id UUID,
        question TEXT,
        answer TEXT,
        link_url TEXT,
        link_text VARCHAR,
        category VARCHAR,
        score REAL
    ) AS $$
DECLARE v_words TEXT [];
BEGIN v_words := STRING_TO_ARRAY(LOWER(p_query), ' ');
RETURN QUERY
SELECT f.id,
    f.question,
    f.answer,
    f.link_url,
    f.link_text,
    f.category,
    (
        SELECT COUNT(*)::REAL / ARRAY_LENGTH(f.keywords, 1)
        FROM UNNEST(f.keywords) kw
        WHERE kw = ANY(v_words)
    ) + (f.priority::REAL / 100) AS score
FROM public.faq_items f
WHERE f.is_active = true
    AND f.keywords && v_words
ORDER BY score DESC
LIMIT 5;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 6. FUNCTION: Create Ticket with Auto-Reply
-- =============================================================================
CREATE OR REPLACE FUNCTION create_support_ticket(
        p_email VARCHAR,
        p_name VARCHAR,
        p_category VARCHAR,
        p_subject VARCHAR,
        p_description TEXT,
        p_user_id UUID DEFAULT NULL
    ) RETURNS TABLE(
        ticket_id UUID,
        ticket_number VARCHAR,
        queue_position INTEGER
    ) AS $$
DECLARE v_ticket_id UUID;
v_ticket_num VARCHAR;
v_queue INTEGER;
BEGIN -- Generate ticket number
v_ticket_num := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((FLOOR(RANDOM() * 10000))::TEXT, 4, '0');
-- Get queue position (use ticket_status instead of status)
SELECT COUNT(*) + 1 INTO v_queue
FROM public.support_tickets
WHERE ticket_status IN ('open', 'in_progress')
    AND created_at > NOW() - INTERVAL '7 days';
-- Create ticket
INSERT INTO public.support_tickets (
        ticket_number,
        user_id,
        email,
        name,
        category,
        subject,
        description,
        auto_reply_sent,
        auto_reply_at
    )
VALUES (
        v_ticket_num,
        p_user_id,
        p_email,
        p_name,
        p_category,
        p_subject,
        p_description,
        true,
        NOW()
    )
RETURNING id INTO v_ticket_id;
RETURN QUERY
SELECT v_ticket_id,
    v_ticket_num,
    v_queue;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 7. RLS POLICIES
-- =============================================================================
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read FAQ" ON public.faq_items;
CREATE POLICY "Public read FAQ" ON public.faq_items FOR
SELECT USING (is_active = true);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Anyone can create tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR
SELECT USING (
        auth.uid() = user_id
        OR email = auth.email()
    );
CREATE POLICY "Anyone can create tickets" ON public.support_tickets FOR
INSERT WITH CHECK (true);
-- =============================================================================
-- COMPLETION
-- =============================================================================
DO $$ BEGIN RAISE NOTICE '✅ AI Admin System created!';
RAISE NOTICE '💬 FAQ chatbot with keyword matching';
RAISE NOTICE '📧 Auto-reply for support tickets';
RAISE NOTICE '🔍 System health monitoring';
RAISE NOTICE '📱 Telegram alert integration';
END $$;