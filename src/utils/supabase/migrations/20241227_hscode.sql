CREATE TABLE IF NOT EXISTS hs_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hs_code TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category TEXT,
    import_duty_percentage NUMERIC DEFAULT 0,
    vat_percentage NUMERIC DEFAULT 10,
    keywords TEXT[], -- For search optimization
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create search index
CREATE INDEX IF NOT EXISTS idx_hscode_keywords ON hs_codes USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_hscode_description ON hs_codes USING GIN(to_tsvector('indonesian', description));

-- RLS (Public read, admin write)
ALTER TABLE hs_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read HS codes" ON hs_codes FOR SELECT USING (true);

-- Seed common HS codes for Indonesian products
INSERT INTO hs_codes (hs_code, description, category, import_duty_percentage, vat_percentage, keywords) VALUES
('6403.99', 'Sepatu dengan sol karet/plastik', 'Footwear', 15, 10, ARRAY['sepatu', 'shoes', 'footwear']),
('6110.20', 'Sweter/Pullover rajut katun', 'Apparel', 15, 10, ARRAY['baju', 'sweater', 'pakaian', 'clothing']),
('8517.62', 'Smartphone dan perangkat telekomunikasi', 'Electronics', 10, 10, ARRAY['hp', 'handphone', 'smartphone', 'elektronik']),
('3304.20', 'Kosmetik untuk mata', 'Cosmetics', 10, 10, ARRAY['makeup', 'kosmetik', 'eyeshadow', 'mascara']),
('9503.00', 'Mainan anak-anak', 'Toys', 7.5, 10, ARRAY['mainan', 'toys', 'boneka', 'action figure']),
('6402.19', 'Sepatu olahraga', 'Footwear', 15, 10, ARRAY['sepatu olahraga', 'sneakers', 'sport shoes']),
('6204.62', 'Celana panjang wanita', 'Apparel', 15, 10, ARRAY['celana', 'pants', 'jeans']),
('8471.30', 'Laptop dan komputer portabel', 'Electronics', 0, 10, ARRAY['laptop', 'notebook', 'computer']),
('3926.90', 'Produk plastik lainnya', 'Plastic Goods', 7.5, 10, ARRAY['plastik', 'plastic', 'container']),
('4202.22', 'Tas tangan/Handbag', 'Bags', 15, 10, ARRAY['tas', 'bag', 'handbag', 'purse'])
ON CONFLICT (hs_code) DO NOTHING;
