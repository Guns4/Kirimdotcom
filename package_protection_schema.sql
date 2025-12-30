-- Enum for insurance status
DROP TYPE IF EXISTS insurance_status CASCADE;
CREATE TYPE insurance_status AS ENUM ('active', 'claimed', 'approved', 'rejected');

-- Table: package_insurances
CREATE TABLE IF NOT EXISTS public.package_insurances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resi_number TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coverage_amount DECIMAL(12,2) DEFAULT 500000.00, -- Default coverage Rp 500k
  premium_paid DECIMAL(12,2) DEFAULT 1000.00,      -- Micro price Rp 1k
  status insurance_status DEFAULT 'active',
  claim_evidence TEXT, -- URL to evidence if claimed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.package_insurances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own insurances" ON public.package_insurances;
CREATE POLICY "Users can view own insurances"
  ON public.package_insurances FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can purchase insurance" ON public.package_insurances;
CREATE POLICY "Users can purchase insurance"
  ON public.package_insurances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for fast lookup by resi
CREATE INDEX IF NOT EXISTS idx_package_insurances_resi ON public.package_insurances(resi_number);
