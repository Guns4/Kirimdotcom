CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    stock INTEGER DEFAULT 0,
    min_stock_alert INTEGER DEFAULT 5,
    price NUMERIC DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, sku)
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own products" ON products FOR ALL USING (auth.uid() = user_id);