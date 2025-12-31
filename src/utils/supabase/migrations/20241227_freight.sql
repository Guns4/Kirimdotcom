CREATE TABLE IF NOT EXISTS freight_forwarders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    services TEXT[], -- ['LCL', 'FCL', 'Air Freight', 'Express']
    routes TEXT[], -- ['China-Indonesia', 'USA-Indonesia', etc]
    logo_url TEXT,
    rating NUMERIC DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS freight_quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    forwarder_id UUID REFERENCES freight_forwarders(id),
    origin_port TEXT NOT NULL,
    destination_port TEXT NOT NULL,
    cargo_type TEXT NOT NULL, -- 'LCL', 'FCL_20', 'FCL_40', 'FCL_40HC'
    commodity TEXT,
    weight_kg NUMERIC,
    volume_cbm NUMERIC,
    quoted_price NUMERIC,
    currency TEXT DEFAULT 'USD',
    transit_days INTEGER,
    valid_until TIMESTAMPTZ,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'QUOTED', 'ACCEPTED', 'REJECTED'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_freight_routes ON freight_forwarders USING GIN(routes);
CREATE INDEX IF NOT EXISTS idx_freight_services ON freight_forwarders USING GIN(services);

-- RLS
ALTER TABLE freight_forwarders ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read forwarders" ON freight_forwarders FOR SELECT USING (true);
CREATE POLICY "Users manage own quotes" ON freight_quotes FOR ALL USING (auth.uid() = user_id);

-- Seed Freight Forwarders
INSERT INTO freight_forwarders (company_name, email, phone, services, routes, is_verified, rating, reviews_count) VALUES
('Pacific Freight Solutions', 'info@pacificfreight.com', '+62-21-5551234', 
 ARRAY['LCL', 'FCL', 'Air Freight'], 
 ARRAY['China-Indonesia', 'Singapore-Indonesia', 'Japan-Indonesia'], 
 true, 4.7, 89),

('Global Cargo Express', 'sales@globalcargo.com', '+62-21-5555678', 
 ARRAY['LCL', 'FCL', 'Express'], 
 ARRAY['USA-Indonesia', 'Europe-Indonesia', 'Dubai-Indonesia'], 
 true, 4.5, 67),

('Asia Shipping Lines', 'contact@asiashipping.com', '+62-21-5559999', 
 ARRAY['FCL', 'LCL'], 
 ARRAY['China-Indonesia', 'Taiwan-Indonesia', 'Korea-Indonesia'], 
 true, 4.8, 124),

('Sky Cargo International', 'info@skycargo.com', '+62-21-5552222', 
 ARRAY['Air Freight', 'Express'], 
 ARRAY['Worldwide'], 
 true, 4.6, 45)
ON CONFLICT DO NOTHING;
