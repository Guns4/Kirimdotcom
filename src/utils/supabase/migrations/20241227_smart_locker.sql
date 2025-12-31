CREATE TABLE IF NOT EXISTS locker_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    locker_provider TEXT NOT NULL, -- 'PaxelBox', 'PopBox', etc
    locker_location TEXT NOT NULL,
    locker_code TEXT, -- Access code/PIN
    locker_size TEXT NOT NULL, -- 'S', 'M', 'L'
    tracking_number TEXT,
    booking_time TIMESTAMPTZ DEFAULT NOW(),
    pickup_deadline TIMESTAMPTZ,
    status TEXT DEFAULT 'BOOKED', -- 'BOOKED', 'DROPPED', 'PICKED_UP', 'EXPIRED'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE locker_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookings" ON locker_bookings FOR ALL USING (auth.uid() = user_id);
