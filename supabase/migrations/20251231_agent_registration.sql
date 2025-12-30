-- Agent Registration Schema
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shop_name TEXT NOT NULL,
    shop_address TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    ktp_url TEXT,
    shop_photo_url TEXT,
    is_paid BOOLEAN DEFAULT FALSE,
    activation_fee DECIMAL(10, 2) DEFAULT 100000,
    status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own agent application"
ON agents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create agent application"
ON agents FOR INSERT
WITH CHECK (auth.uid() = user_id);
