-- Table: COD Insurance Policies
CREATE TABLE IF NOT EXISTS public.cod_insurance_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    resi TEXT NOT NULL,
    premium_amount DECIMAL(19,4) DEFAULT 500, -- Rp 500 per resi
    coverage_amount DECIMAL(19,4) NOT NULL,   -- Shipping Cost (Ongkir)
    status TEXT DEFAULT 'ACTIVE',             -- ACTIVE, EXPIRED (Delivered), CLAIMED
    claim_status TEXT DEFAULT NULL,           -- NULL, AUTO_APPROVED, PAID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cod_insurance_resi ON public.cod_insurance_policies(resi);
CREATE INDEX IF NOT EXISTS idx_cod_insurance_status ON public.cod_insurance_policies(status);
