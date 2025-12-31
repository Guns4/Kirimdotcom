CREATE TABLE IF NOT EXISTS fleet_vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_name TEXT NOT NULL,
    plate_number TEXT NOT NULL,
    driver_name TEXT,
    driver_phone TEXT,
    device_id TEXT, -- GPS tracker device ID
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, plate_number)
);

CREATE TABLE IF NOT EXISTS fleet_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    speed NUMERIC DEFAULT 0, -- km/h
    heading NUMERIC DEFAULT 0, -- degrees
    accuracy NUMERIC DEFAULT 0, -- meters
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fleet_locations_vehicle ON fleet_locations(vehicle_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_fleet_locations_time ON fleet_locations(timestamp);

-- RLS
ALTER TABLE fleet_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own vehicles" ON fleet_vehicles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own vehicle locations" ON fleet_locations 
    FOR SELECT USING (EXISTS (SELECT 1 FROM fleet_vehicles WHERE id = vehicle_id AND user_id = auth.uid()));
