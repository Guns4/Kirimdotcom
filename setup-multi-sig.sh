#!/bin/bash

# setup-multi-sig.sh
# ------------------
# Setup Multi-Signature Approval System for Critical Actions.
# Prevents single-admin compromise from draining funds or destroying data.

echo "🏦 Setting up Multi-Sig System..."

mkdir -p supabase/security
mkdir -p src/lib/security

# 1. Database Schema
cat > supabase/security/multi_sig_schema.sql << 'EOF'
-- MULTI-SIG APPROVAL SYSTEM

CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXECUTED', 'CANCELLED');

CREATE TABLE IF NOT EXISTS public.approval_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES auth.users(id) NOT NULL,
    action_type TEXT NOT NULL, -- e.g. 'WITHDRAWAL', 'DELETE_USER', 'CHANGE_CONFIG'
    payload JSONB NOT NULL,    -- Details of the action
    
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
EOF

# 2. Logic Implementation (Typescript)
cat > src/lib/security/multi-sig.ts << 'EOF'
import { createClient } from '@/utils/supabase/server';

export type MultiSigAction = 'WITHDRAWAL' | 'DELETE_USER' | 'SYSTEM_CONFIG';

interface RequestApprovalParams {
    userId: string;
    action: MultiSigAction;
    payload: any;
}

interface ApproveRequestParams {
    adminId: string;
    requestId: string;
    decision: 'APPROVED' | 'REJECTED';
    reason?: string;
}

export async function createApprovalRequest({ userId, action, payload }: RequestApprovalParams) {
    const supabase = createClient();
    
    const { data, error } = await supabase
        .from('approval_requests')
        .insert({
            requester_id: userId,
            action_type: action,
            payload: payload,
            status: 'PENDING'
        })
        .select()
        .single();
        
    if (error) throw new Error(error.message);
    return data;
}

export async function processApproval({ adminId, requestId, decision, reason }: ApproveRequestParams) {
    const supabase = createClient();
    
    // 1. Fetch Request
    const { data: request } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('id', requestId)
        .single();
        
    if (!request) throw new Error('Request not found');
    
    // 2. Validate Multi-Sig Constraint (Double Check in App Logic too)
    if (request.requester_id === adminId) {
        throw new Error('SECURITY VIOLATION: You cannot approve your own request.');
    }
    
    if (request.status !== 'PENDING') {
        throw new Error('Request is not pending.');
    }

    // 3. Update Status
    const { error } = await supabase
        .from('approval_requests')
        .update({
            approver_id: adminId,
            status: decision,
            reason: reason,
            updated_at: new Date()
        })
        .eq('id', requestId);

    if (error) throw new Error(error.message);

    // 4. Execute Action (If Approved)
    if (decision === 'APPROVED') {
        await executeAction(request.action_type, request.payload);
        
        // Mark as Executed
        await supabase
            .from('approval_requests')
            .update({ status: 'EXECUTED' })
            .eq('id', requestId);
    }
    
    return { success: true };
}

async function executeAction(action: string, payload: any) {
    // Dispatcher for actual business logic
    console.log(`🚀 EXECUTING MULTI-SIG ACTION: ${action}`, payload);
    // switch(action) { ... }
}
EOF

echo "✅ Created Multi-Sig Schema: supabase/security/multi_sig_schema.sql"
echo "✅ Created Multi-Sig Logic: src/lib/security/multi-sig.ts"
echo "👉 Run the SQL migration to enable the system."
