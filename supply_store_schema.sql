-- Products Table
CREATE TABLE IF NOT EXISTS public.supply_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(19,4) NOT NULL,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    category TEXT CHECK (category IN ('lakban', 'plastik', 'printer', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Data (Idempotent)
INSERT INTO public.supply_products (name, price, stock, image_url, category)
SELECT 'Lakban Bening 100 Yard', 8000, 500, 'https://placehold.co/100?text=Lakban', 'lakban'
WHERE NOT EXISTS (SELECT 1 FROM public.supply_products WHERE name = 'Lakban Bening 100 Yard');

INSERT INTO public.supply_products (name, price, stock, image_url, category)
SELECT 'Bubble Wrap 50m', 45000, 100, 'https://placehold.co/100?text=Bubble', 'plastik'
WHERE NOT EXISTS (SELECT 1 FROM public.supply_products WHERE name = 'Bubble Wrap 50m');

INSERT INTO public.supply_products (name, price, stock, image_url, category)
SELECT 'Thermal Paper 100x150', 35000, 200, 'https://placehold.co/100?text=Label', 'printer'
WHERE NOT EXISTS (SELECT 1 FROM public.supply_products WHERE name = 'Thermal Paper 100x150');

-- Ledger Entries (Ensure it exists)
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    amount DECIMAL(19,4) NOT NULL, -- Negative for purchase
    description TEXT,
    type TEXT, -- PURCHASE, TOPUP, etc.
    reference_id UUID, -- Link to product/order
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
