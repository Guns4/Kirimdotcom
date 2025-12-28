-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    stock INTEGER DEFAULT 0,
    cost_price INTEGER DEFAULT 0,
    sell_price INTEGER,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, sku)
);
-- RLS Policies
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own inventory" ON inventory_items FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inventory" ON inventory_items FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inventory" ON inventory_items FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own inventory" ON inventory_items FOR DELETE USING (auth.uid() = user_id);
-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_inventory_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS inventory_timestamp ON inventory_items;
CREATE TRIGGER inventory_timestamp BEFORE
UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_inventory_timestamp();
-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_inventory_user ON inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory_items(stock)
WHERE stock < 5;