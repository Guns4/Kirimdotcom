-- Drop tables if they exist to ensure clean schema (WARNING: DELETES DATA)
DROP TABLE IF EXISTS public.user_subscriptions CASCADE;
DROP TABLE IF EXISTS public.subscription_plans CASCADE;

-- Subscription Plans Table
CREATE TABLE public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    price integer NOT NULL,
    features jsonb DEFAULT '[]'::jsonb,
    max_resi_per_day integer DEFAULT 5,
    max_whatsapp_notif integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Subscriptions Table
CREATE TABLE public.user_subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id uuid REFERENCES public.subscription_plans(id),
    status text DEFAULT 'active', -- active, expired, cancelled
    start_date timestamp with time zone DEFAULT timezone('utc'::text, now()),
    end_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
-- Plans: Readable by everyone
CREATE POLICY "Plans are viewable by everyone" ON public.subscription_plans
    FOR SELECT USING (true);

-- User Subscriptions: Users can see their own
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Seed Data
INSERT INTO public.subscription_plans (name, price, features, max_resi_per_day, max_whatsapp_notif)
VALUES 
('Free', 0, '["Basic Tracking", "5 Resi/Day"]', 5, 0),
('Pro', 50000, '["Unlimited Tracking", "WhatsApp Notif 50/mo", "Priority Support"]', 100, 50),
('Business', 150000, '["API Access", "Unlimited Notif", "Dedicated Manager"]', 1000, 1000);
