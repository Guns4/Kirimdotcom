-- Table to link local products to provider codes
CREATE TABLE IF NOT EXISTS public.provider_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_code TEXT UNIQUE NOT NULL, -- Internal SKU
    provider_code TEXT NOT NULL,       -- e.g. 'P-TELKOMSEL-10'
    provider_name TEXT NOT NULL,       -- 'DIGIFLAZZ' or 'TRIPAY'
    
    cost_price DECIMAL(19,4) NOT NULL DEFAULT 0,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    
    is_active BOOLEAN DEFAULT TRUE,
    auto_sync BOOLEAN DEFAULT TRUE
);

-- Table for Margin Config
CREATE TABLE IF NOT EXISTS public.product_margins (
    product_code TEXT PRIMARY KEY REFERENCES public.provider_products(product_code),
    fixed_margin DECIMAL(19,4) DEFAULT 500, -- Default margin Rp 500
    min_selling_price DECIMAL(19,4) DEFAULT 0
);
