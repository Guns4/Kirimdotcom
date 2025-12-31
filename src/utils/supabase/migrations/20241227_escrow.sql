CREATE TABLE IF NOT EXISTS escrow_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES auth.users(id),
    vendor_id UUID REFERENCES vendors(id), -- Assuming vendors table from previous module
    service_id UUID, -- Optional link to vendor_services
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'PENDING_PAYMENT', -- PENDING_PAYMENT, PAID_HELD, WORK_SUBMITTED, COMPLETED, DISPUTED, CANCELLED
    description TEXT,
    proof_of_work_url TEXT,
    admin_fee NUMERIC, -- 5% usually
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own transactions" ON escrow_transactions
    FOR SELECT USING (auth.uid() = buyer_id OR EXISTS (SELECT 1 FROM vendors WHERE id = vendor_id AND user_id = auth.uid()));
