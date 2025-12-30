-- Enum: Dispute Status
CREATE TYPE dispute_status AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED_BUYER', 'RESOLVED_SELLER', 'CANCELLED');

-- Table: Disputes
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL, -- Reference to order/transaction
    buyer_id UUID REFERENCES auth.users(id),
    seller_id UUID REFERENCES auth.users(id),
    amount DECIMAL(19,4) NOT NULL, -- Amount in dispute
    reason TEXT NOT NULL, -- Buyer's complaint
    status dispute_status DEFAULT 'OPEN',
    resolved_by UUID REFERENCES auth.users(id), -- Admin who resolved
    resolution_notes TEXT, -- Admin's decision reasoning
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Table: Dispute Messages (Chat History)
CREATE TABLE IF NOT EXISTS public.dispute_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dispute_id UUID REFERENCES public.disputes(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id),
    sender_type TEXT NOT NULL, -- BUYER, SELLER, ADMIN
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: Dispute Evidence (Photos/Files)
CREATE TABLE IF NOT EXISTS public.dispute_evidence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dispute_id UUID REFERENCES public.disputes(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES auth.users(id),
    file_url TEXT NOT NULL, -- URL to Supabase Storage or external
    file_type TEXT, -- image/jpeg, image/png, etc
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_buyer ON public.disputes(buyer_id);
CREATE INDEX IF NOT EXISTS idx_disputes_seller ON public.disputes(seller_id);
CREATE INDEX IF NOT EXISTS idx_dispute_messages_dispute ON public.dispute_messages(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_evidence_dispute ON public.dispute_evidence(dispute_id);

-- RLS Policies (Admin only for now)
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_evidence ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all
-- (Requires admin_profiles table from Task 93)
CREATE POLICY "Admins can view disputes" ON disputes
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can view messages" ON dispute_messages
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can view evidence" ON dispute_evidence
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()));
