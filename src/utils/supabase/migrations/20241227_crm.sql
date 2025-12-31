CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT, -- Normalized phone number
    email TEXT,
    address TEXT,
    city TEXT,
    total_spend NUMERIC DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    last_order_at TIMESTAMPTZ,
    tags TEXT[], -- ['VIP', 'Blacklist', 'New']
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, phone),
    UNIQUE(user_id, email)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_total_spend ON customers(total_spend);

-- RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own customers" ON customers
    FOR ALL USING (auth.uid() = user_id);
