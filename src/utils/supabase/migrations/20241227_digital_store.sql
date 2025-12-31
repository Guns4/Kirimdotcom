-- Digital Products Table
CREATE TABLE IF NOT EXISTS digital_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    file_url TEXT NOT NULL, -- Supabase Storage path (private bucket)
    file_size INTEGER, -- in bytes
    category TEXT, -- 'ebook', 'template', 'design', 'software'
    preview_image TEXT,
    download_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Purchases Table
CREATE TABLE IF NOT EXISTS user_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES digital_products(id) ON DELETE CASCADE,
    purchase_price NUMERIC NOT NULL,
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    payment_method TEXT, -- 'simulate', 'stripe', 'midtrans', etc
    transaction_id TEXT UNIQUE,
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMPTZ,
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id) -- Prevent duplicate purchases
);

-- Download Log Table (for analytics)
CREATE TABLE IF NOT EXISTS product_downloads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_id UUID REFERENCES user_purchases(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES digital_products(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_digital_products_category ON digital_products(category);
CREATE INDEX IF NOT EXISTS idx_digital_products_active ON digital_products(is_active);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_status ON user_purchases(payment_status);

-- RLS Policies
ALTER TABLE digital_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_downloads ENABLE ROW LEVEL SECURITY;

-- Anyone can view active products
CREATE POLICY "Public read active products" ON digital_products 
    FOR SELECT USING (is_active = true);

-- Only product owners can update their products
CREATE POLICY "Owners manage products" ON digital_products 
    FOR ALL USING (auth.uid() = created_by);

-- Users can view their own purchases
CREATE POLICY "Users view own purchases" ON user_purchases 
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create purchases
CREATE POLICY "Users create purchases" ON user_purchases 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their download history
CREATE POLICY "Users view own downloads" ON product_downloads 
    FOR SELECT USING (auth.uid() = user_id);

-- Seed Sample Digital Products
INSERT INTO digital_products (title, description, price, file_url, category, preview_image) VALUES
('E-book: Panduan Lengkap Logistik Indonesia', 
 'Panduan komprehensif tentang sistem logistik di Indonesia untuk UMKM', 
 99000, 
 'private/ebooks/panduan-logistik-indonesia.pdf',
 'ebook',
 '/images/products/ebook-logistik.jpg'),

('Template Excel: Laporan Keuangan UMKM',
 'Template laporan keuangan lengkap dengan rumus otomatis',
 49000,
 'private/templates/laporan-keuangan-umkm.xlsx',
 'template',
 '/images/products/template-keuangan.jpg'),

('Template Canva: Social Media Kit Bisnis Online',
 'Paket lengkap 30 template Canva untuk promosi bisnis online',
 79000,
 'private/designs/social-media-kit.zip',
 'design',
 '/images/products/social-media-kit.jpg'),

('Checklist Operasional Gudang',
 'Checklist lengkap untuk manajemen gudang dan inventory',
 29000,
 'private/templates/checklist-gudang.pdf',
 'template',
 '/images/products/checklist-gudang.jpg')
ON CONFLICT DO NOTHING;

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE digital_products 
    SET download_count = download_count + 1 
    WHERE id = NEW.product_id;
    
    UPDATE user_purchases 
    SET download_count = download_count + 1,
        last_downloaded_at = NOW()
    WHERE id = NEW.purchase_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_download_count
AFTER INSERT ON product_downloads
FOR EACH ROW
EXECUTE FUNCTION increment_download_count();
