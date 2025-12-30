-- Pickup Requests Table
CREATE TABLE IF NOT EXISTS public.pickup_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    courier_id UUID REFERENCES auth.users(id), -- Courier is also a user type
    status TEXT DEFAULT 'PENDING', -- PENDING, ASSIGNED, ON_THE_WAY, COMPLETED, CANCELLED
    pickup_address TEXT,
    lat DECIMAL(10, 8),
    lng DECIMAL(10, 8),
    fee DECIMAL(19,4) DEFAULT 10000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courier Live Locations (for tracking)
CREATE TABLE IF NOT EXISTS public.courier_locations (
    courier_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    lat DECIMAL(10, 8),
    lng DECIMAL(10, 8),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_online BOOLEAN DEFAULT FALSE
);
