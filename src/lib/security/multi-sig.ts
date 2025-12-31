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
