-- Digital Store Schema
-- Templates, Ebooks & Digital Products

-- Digital Products
CREATE TABLE IF NOT EXISTS digital_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES auth.users(id),
    
    -- Product Info
    name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- TEMPLATE, EBOOK, SOFTWARE, COURSE, OTHER
    thumbnail_url TEXT,
    
    -- Pricing
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2),
    is_free BOOLEAN DEFAULT FALSE,
    
    -- File
    file_path TEXT NOT NULL, -- Path in Supabase Storage (private bucket)
    file_size INT,
    file_type TEXT, -- PDF, ZIP, MP4, etc.
    
    -- Stats
    download_count INT DEFAULT 0,
    sales_count INT DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Digital Purchases
CREATE TABLE IF NOT EXISTS digital_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES digital_products(id),
    
    -- Payment
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_status TEXT DEFAULT 'PENDING', -- PENDING, PAID, FAILED, REFUNDED
    payment_method TEXT,
    
    -- Delivery
    download_count INT DEFAULT 0,
    max_downloads INT DEFAULT 5,
    last_download_at TIMESTAMP WITH TIME ZONE,
    
    -- Email
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Download Tokens (Signed URLs)
CREATE TABLE IF NOT EXISTS download_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID REFERENCES digital_purchases(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    
    -- Validity
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    
    -- Security
    ip_address TEXT,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE digital_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_tokens ENABLE ROW LEVEL SECURITY;

-- Anyone can view active products
CREATE POLICY "Anyone can view active products" ON digital_products
FOR SELECT USING (is_active = true);

-- Sellers manage their products
CREATE POLICY "Sellers manage their products" ON digital_products
FOR ALL USING (auth.uid() = seller_id);

-- Users view their purchases
CREATE POLICY "Users view their purchases" ON digital_purchases
FOR SELECT USING (auth.uid() = user_id);

-- Users can create purchases
CREATE POLICY "Users can create purchases" ON digital_purchases
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_digital_products_category ON digital_products(category);
CREATE INDEX idx_digital_products_seller ON digital_products(seller_id);
CREATE INDEX idx_digital_purchases_user ON digital_purchases(user_id, created_at DESC);
CREATE INDEX idx_download_tokens_token ON download_tokens(token);
