-- Feature Flags Table
CREATE TABLE IF NOT EXISTS public.feature_flags (
    key text PRIMARY KEY,
    description text,
    is_enabled boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Enable RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
-- Policy (Read Publicly)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.feature_flags;
CREATE POLICY "Enable read access for all users" ON public.feature_flags FOR
SELECT USING (true);
-- Seed Data
INSERT INTO public.feature_flags (key, description, is_enabled)
VALUES (
        'promo_lebaran',
        'Banner Promo Lebaran 50%',
        true
    ),
    (
        'maintenance_mode',
        'Global Maintenance Screen',
        false
    ),
    (
        'new_payment_gateway',
        'Beta Payment System',
        false
    ) ON CONFLICT (key) DO
UPDATE
SET description = EXCLUDED.description,
    is_enabled = EXCLUDED.is_enabled;