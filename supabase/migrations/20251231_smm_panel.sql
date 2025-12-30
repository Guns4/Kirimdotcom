-- SMM Panel Integration Schema
-- Digital Service Arbitrage - Provider and Service Management

-- SMM Providers (API Sources)
CREATE TABLE IF NOT EXISTS smm_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    api_url TEXT NOT NULL,
    api_key TEXT NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    
    -- Rate limiting
    rate_limit INT DEFAULT 100, -- requests per minute
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMM Services (Synced from Providers)
CREATE TABLE IF NOT EXISTS smm_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES smm_providers(id) ON DELETE CASCADE,
    
    -- Provider's service data
    provider_service_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    
    -- Pricing
    provider_price DECIMAL(10,2) NOT NULL, -- Original price
    markup_percent DECIMAL(5,2) DEFAULT 50, -- Markup percentage
    sell_price DECIMAL(10,2) NOT NULL, -- Final selling price
    
    -- Limits
    min_quantity INT DEFAULT 100,
    max_quantity INT DEFAULT 10000,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(provider_id, provider_service_id)
);

-- SMM Orders
CREATE TABLE IF NOT EXISTS smm_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES smm_services(id),
    
    -- Order details
    provider_order_id TEXT,
    target_url TEXT NOT NULL,
    quantity INT NOT NULL,
    
    -- Pricing
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'PENDING', -- PENDING, PROCESSING, IN_PROGRESS, COMPLETED, CANCELLED, REFUNDED
    start_count INT,
    current_count INT,
    remains INT,
    
    -- Provider response
    provider_status TEXT,
    provider_response JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- RLS Policies
ALTER TABLE smm_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE smm_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE smm_orders ENABLE ROW LEVEL SECURITY;

-- Only admins can manage providers
CREATE POLICY "Only admins can view providers" ON smm_providers FOR SELECT TO authenticated USING (true);

-- Everyone can view active services
CREATE POLICY "Anyone can view active services" ON smm_services FOR SELECT USING (is_active = true);

-- Users can view their own orders
CREATE POLICY "Users can view their own orders" ON smm_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON smm_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_smm_services_category ON smm_services(category);
CREATE INDEX idx_smm_services_active ON smm_services(is_active);
CREATE INDEX idx_smm_orders_user ON smm_orders(user_id, created_at DESC);
CREATE INDEX idx_smm_orders_status ON smm_orders(status);
