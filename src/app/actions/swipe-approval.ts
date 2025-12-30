'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getPendingWithdrawalsForSwipe() {
  const supabase = await createClient();

  // Fetch pending withdrawals joined with user data for risk score context
  const { data, error } = await supabase
    .from('ledger_entries')
    .select(
      `
            *,
            user:user_id(
                email,
                user_metadata
            )
        `
    )
    .eq('type', 'WITHDRAWAL')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: true }) // Oldest first
    .limit(20); // Batch size

  if (error) {
    console.error('Error fetching swipe items:', error);
    return [];
  }

  // Transform to simple Queue Item
  // Note: Adjust property access based on actual Supabase response structure
  return (data || []).map((tx) => ({
    id: tx.id,
    userId: tx.user_id,
    email: tx.user?.email || 'Unknown',
    amount: Math.abs(tx.amount || 0),
    bankDetails: tx.description, // Assuming description holds bank info "Withdraw to BCA 123..."
    riskScore: tx.user?.user_metadata?.risk_score || 0, // Mock or actual field
    date: tx.created_at,
  }));
}

export async function approveWithdrawalSwipe(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('ledger_entries')
    .update({
      status: 'COMPLETED',
      metadata: {
        method: 'SWIPE_APPROVAL',
        approved_at: new Date().toISOString(),
      },
    })
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/admin/finance/swipe-approval');
  return { success: true };
}

export async function rejectWithdrawalSwipe(id: string, reason: string) {
  const supabase = await createClient();

  // In a real app, you might want to refund the balance back to the user's wallet here
  // For now, we just mark as REJECTED
  const { error } = await supabase
    .from('ledger_entries')
    .update({
      status: 'REJECTED',
      description: `REJECTED: ${reason}`, // Append reason
      metadata: {
        method: 'SWIPE_REJECTION',
        rejected_at: new Date().toISOString(),
      },
    })
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/admin/finance/swipe-approval');
  return { success: true };
}
