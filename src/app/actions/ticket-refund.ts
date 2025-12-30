'use server';

import { SmartRefundSystem } from '@/lib/smart-refund';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function attemptAutoRefund(ticketId: string) {
    const supabase = await createClient();

    // 1. Auth Guard (Admin Only)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Check Admin Role
    const { data: admin } = await (supabase as any)
        .from('admin_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!admin) throw new Error('Forbidden');

    // 2. Process
    try {
        const result = await SmartRefundSystem.processTicketRefund(ticketId);

        // 3. Revalidate UI
        revalidatePath(`/admin/tickets/${ticketId}`);
        revalidatePath('/admin/tickets');

        return result;
    } catch (error: any) {
        console.error('Auto Refund Error:', error);
        return { success: false, message: error.message, actionTaken: 'IGNORED' };
    }
}
