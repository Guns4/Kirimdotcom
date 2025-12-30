-- Gigs Table (Services Offered)
CREATE TABLE IF NOT EXISTS public.gigs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    freelancer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    rate_per_hour DECIMAL(19,4) NOT NULL,
    city TEXT NOT NULL,
    skills TEXT[], -- ['packing', 'admin', 'driver']
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gig Bookings (Escrow System)
CREATE TABLE IF NOT EXISTS public.gig_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gig_id UUID REFERENCES public.gigs(id),
    client_id UUID REFERENCES auth.users(id),
    freelancer_id UUID REFERENCES auth.users(id),
    hours INTEGER NOT NULL,
    total_amount DECIMAL(19,4) NOT NULL,
    status TEXT DEFAULT 'PENDING_ESCROW', -- PENDING_ESCROW, IN_PROGRESS, COMPLETED, DISPUTED, CANCELLED
    escrow_held_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Dummy Gigs
INSERT INTO public.gigs (title, rate_per_hour, city, skills)
VALUES 
('Tukang Packing Profesional', 25000, 'Jakarta Selatan', ARRAY['packing', 'bubble-wrap', 'labelling']),
('Admin Chat Streamer', 30000, 'Bandung', ARRAY['admin', 'chat-response', 'livestream']),
('Kurir Motor Harian', 150000, 'Surabaya', ARRAY['driver', 'motor', 'instant-courier']);
