CREATE TABLE IF NOT EXISTS vendors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Photographer', 'Designer', 'Admin', 'Packaging'
    description TEXT,
    portfolio_urls TEXT[],
    rating NUMERIC DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS vendor_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    delivery_days INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_services ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public profiles" ON vendors FOR SELECT USING (true);
CREATE POLICY "Public services" ON vendor_services FOR SELECT USING (true);

-- Vendor manage own
CREATE POLICY "Vendors manage own profile" ON vendors 
    FOR ALL USING (auth.uid() = user_id);
    
CREATE POLICY "Vendors manage own services" ON vendor_services 
    FOR ALL USING (EXISTS (SELECT 1 FROM vendors WHERE id = vendor_id AND user_id = auth.uid()));
