-- 1. Anonymized Analytical View
-- Aggregates data for reporting (Safe for public consumption)
CREATE OR REPLACE VIEW view_anonymized_trends AS
SELECT 
    TO_CHAR(created_at, 'YYYY-MM') as month_period,
    origin_city,
    destination_city,
    courier,
    COUNT(*) as shipment_count,
    SUM(package_weight) as total_weight_grams
FROM public.shipping_bookings
WHERE status IN ('picked_up', 'completed', 'confirmed') -- Only valid shipments
GROUP BY 1, 2, 3, 4;

-- 2. Report Catalog (Products)
CREATE TABLE IF NOT EXISTS public.business_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) DEFAULT 500000,
  report_type VARCHAR(50), -- 'monthly_trend', 'city_analysis'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Reports
INSERT INTO public.business_reports (title, description, price, report_type)
VALUES 
  ('Laporan Tren Logistik Q1 2025', 'Analisa lengkap pengiriman domestik, top rute, dan performa kurir Q1.', 750000, 'monthly_trend'),
  ('Top 10 Kota Tujuan E-Commerce', 'Data volume pengiriman terlaris berdasarkan kota tujuan untuk strategi pemasaran.', 500000, 'city_analysis')
ON CONFLICT DO NOTHING;

-- 3. Purchases
CREATE TABLE IF NOT EXISTS public.report_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  report_id UUID REFERENCES public.business_reports(id) NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  price_paid DECIMAL(12,2) NOT NULL,
  UNIQUE(user_id, report_id)
);

-- RLS
ALTER TABLE public.business_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read reports" ON public.business_reports;
CREATE POLICY "Public read reports" ON public.business_reports FOR SELECT USING (is_active = true);

ALTER TABLE public.report_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User read purchases" ON public.report_purchases;
CREATE POLICY "User read purchases" ON public.report_purchases FOR SELECT USING (auth.uid() = user_id);
