-- ============================================
-- CEKKIRIM.COM - SUPABASE DATABASE SCHEMA
-- ============================================
-- Project ID: onkmywglrpjqulhephkf
-- Description: Database schema for CekKirim tracking application
-- ============================================
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- ============================================
-- TABLE: profiles
-- Description: User profile information with role-based access
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'premium', 'user')),
    avatar_url TEXT,
    subscription_status TEXT DEFAULT 'inactive' CHECK (
        subscription_status IN ('active', 'inactive', 'expired')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR
SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR
INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (auth.uid() = id);
-- ============================================
-- TABLE: site_settings
-- Description: Global site configuration (logo, maintenance mode, announcements)
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    logo_url TEXT,
    maintenance_mode BOOLEAN DEFAULT false NOT NULL,
    announcement_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Insert default settings
INSERT INTO site_settings (
        id,
        logo_url,
        maintenance_mode,
        announcement_text
    )
VALUES (
        uuid_generate_v4(),
        '/logo.png',
        false,
        NULL
    ) ON CONFLICT DO NOTHING;
-- Enable Row Level Security (RLS)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
-- RLS Policies for site_settings
CREATE POLICY "Site settings are viewable by everyone" ON site_settings FOR
SELECT USING (true);
CREATE POLICY "Only admins can update site settings" ON site_settings FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
        )
    );
-- ============================================
-- TABLE: search_history
-- Description: User search history for tracking and analytics
-- ============================================
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('resi', 'ongkir')),
    query TEXT NOT NULL,
    result_summary JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_type ON search_history(type);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);
-- Enable Row Level Security (RLS)
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
-- RLS Policies for search_history
CREATE POLICY "Users can view their own search history" ON search_history FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own search history" ON search_history FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all search history" ON search_history FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
        )
    );
-- ============================================
-- FUNCTIONS: Auto-update timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = timezone('utc'::text, now());
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Triggers for auto-updating timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE
UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE
UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ============================================
-- FUNCTION: Auto-create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.profiles (id, email, role)
VALUES (NEW.id, NEW.email, 'user');
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- ============================================
-- GRANT PERMISSIONS
-- ============================================
-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon,
    authenticated;
-- Grant table permissions
GRANT SELECT ON profiles TO anon;
GRANT ALL ON profiles TO authenticated;
GRANT SELECT ON site_settings TO anon,
    authenticated;
GRANT UPDATE ON site_settings TO authenticated;
GRANT SELECT,
    INSERT ON search_history TO authenticated;
-- ============================================
-- COMPLETED
-- ============================================
-- Run this script in Supabase SQL Editor
-- Make sure to review RLS policies before production