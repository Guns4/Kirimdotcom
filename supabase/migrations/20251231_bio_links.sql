-- Bio Link Schema
-- Phase: Marketing Tools

-- 1. Bio Profiles (One per user)
CREATE TABLE IF NOT EXISTS public.bio_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE, -- The slug for the URL
    display_name TEXT,
    bio_text TEXT,
    avatar_url TEXT,
    theme_color TEXT DEFAULT '#000000', -- Hex code
    whatsapp_number TEXT,
    courier_filters TEXT[], -- Array of courier codes enabled for tracker
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bio_profiles_username ON public.bio_profiles(username);

-- 2. Bio Links (Custom Links)
CREATE TABLE IF NOT EXISTS public.bio_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.bio_profiles(id) NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT, -- Lucide icon name or emoji
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bio Products (Showcase items)
CREATE TABLE IF NOT EXISTS public.bio_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.bio_profiles(id) NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    image_url TEXT,
    external_url TEXT, -- Link to purchase
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Analytics
CREATE TABLE IF NOT EXISTS public.bio_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.bio_profiles(id) NOT NULL,
    event_type TEXT NOT NULL, -- VIEW, CLICK_LINK, CLICK_WA, CHECK_RESI
    event_metadata JSONB, -- { link_id: ..., courier: ... }
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RLS
ALTER TABLE public.bio_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bio_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bio_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bio_analytics ENABLE ROW LEVEL SECURITY;

-- Public Access Policies
CREATE POLICY "Public view active profiles" ON public.bio_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Public view active links" ON public.bio_links FOR SELECT USING (is_active = true);
CREATE POLICY "Public view active products" ON public.bio_products FOR SELECT USING (true);
CREATE POLICY "Public insert analytics" ON public.bio_analytics FOR INSERT WITH CHECK (true); -- Allow tracking

-- Owner Access Policies
CREATE POLICY "Owner manage profile" ON public.bio_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Owner manage links" ON public.bio_links FOR ALL USING (
    EXISTS (SELECT 1 FROM public.bio_profiles WHERE id = bio_links.profile_id AND user_id = auth.uid())
);
CREATE POLICY "Owner manage bio products" ON public.bio_products FOR ALL USING (
    EXISTS (SELECT 1 FROM public.bio_profiles WHERE id = bio_products.profile_id AND user_id = auth.uid())
);
CREATE POLICY "Owner view analytics" ON public.bio_analytics FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bio_profiles WHERE id = bio_analytics.profile_id AND user_id = auth.uid())
);
