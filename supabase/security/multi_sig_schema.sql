-- MULTI-SIG APPROVAL SYSTEM

CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXECUTED', 'CANCELLED');

CREATE TABLE IF NOT EXISTS public.approval_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES auth.users(id) NOT NULL,
    action_type TEXT NOT NULL, -- e.g. 'WITHDRAWAL', 'DELETE_USER', 'CHANGE_CONFIG'
    payload JSONB NOT NULL,    -- Details of the action
    amount NUMERIC,            -- NEW: Optional amount for financial requests
    
    approver_id UUID REFERENCES auth.users(id),
    status approval_status DEFAULT 'PENDING',
    
    reason TEXT, -- Rejection reason or Approval note
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- SELF-APPROVAL CONSTRAINT: Requester cannot be Approver
    CONSTRAINT no_self_approval CHECK (requester_id != approver_id)
);

-- RLS Policies
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

-- Everyone can create requests (if admin)
CREATE POLICY "Admins can create requests" ON public.approval_requests
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- Everyone can view requests
CREATE POLICY "Admins can view requests" ON public.approval_requests
    FOR SELECT USING (true);

-- Only DIFFERENT admin can update (approve/reject)
CREATE POLICY "Different admin can approve" ON public.approval_requests
    FOR UPDATE
    USING (auth.uid() != requester_id)
    WITH CHECK (auth.uid() != requester_id);
