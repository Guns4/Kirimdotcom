#!/bin/bash

# setup-smart-refund.sh
# Implementasi Otomatisasi Refund Cerdas (Task 1636-1640)

echo ">>> Setting up Smart Refund System..."

# 1. Create Core Logic Library
echo ">>> Creating src/lib/smart-refund.ts..."
cat << 'EOF' > src/lib/smart-refund.ts
import { createClient } from '@/utils/supabase/server';

interface RefundResult {
  success: boolean;
  message: string;
  actionTaken: 'REFUNDED' | 'ESCALATED' | 'IGNORED';
}

export class SmartRefundSystem {
  /**
   * Verify and Process Refund for a Ticket
   */
  static async processTicketRefund(ticketId: string): Promise<RefundResult> {
    const supabase = await createClient();

    // 1. Fetch Ticket & Transaction Info
    const { data: ticket, error: ticketError } = await (supabase as any)
      .from('tickets')
      .select('*, profiles:user_id(full_name, email)')
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      return { success: false, message: 'Ticket not found', actionTaken: 'IGNORED' };
    }

    const transactionId = ticket.transaction_id;
    if (!transactionId) {
       return { success: false, message: 'No transaction linked to ticket', actionTaken: 'ESCALATED' };
    }

    // 2. Check Real Transaction Status
    const { data: transaction, error: txError } = await (supabase as any)
      .from('payment_history')
      .select('status, amount, user_id')
      .eq('id', transactionId)
      .single();

    if (txError || !transaction) {
       return { success: false, message: 'Transaction record not found', actionTaken: 'ESCALATED' };
    }

    // 3. LOGIC MATRIX
    if (transaction.status === 'failed' || transaction.status === 'expired' || transaction.status === 'error') {
       // --- AUTO REFUND SCENARIO ---
       
       // A. Credit User Wallet
       const { error: ledgerError } = await (supabase as any)
         .from('ledger_entries')
         .insert({
            user_id: ticket.user_id,
            amount: transaction.amount,
            type: 'REFUND',
            description: `Auto Refund for Tx: ${transactionId}`,
            status: 'COMPLETED'
         });

       if (ledgerError) {
         console.error('Refund Ledger Error:', ledgerError);
         return { success: false, message: 'System Error: Ledger Insert Failed', actionTaken: 'ESCALATED' };
       }

       // B. Auto-Close Ticket & Reply
       await (supabase as any).from('ticket_messages').insert({
         ticket_id: ticketId,
         sender_role: 'system',
         message: '🤖 [AUTO] Sistem mendeteksi transaksi GAGAL/EXPIRED.\n\n✅ Dana telah dikembalikan otomatis ke Saldo Akun kakak.\nTiket ditutup.'
       });

       await (supabase as any)
         .from('tickets')
         .update({ status: 'closed', resolved_at: new Date().toISOString() })
         .eq('id', ticketId);

       return { success: true, message: 'Refund Processed & Ticket Closed', actionTaken: 'REFUNDED' };

    } else {
       // --- MANUAL REVIEW SCENARIO (Success/Pending/Unknown) ---
       
       // Escalate
       await (supabase as any).from('ticket_messages').insert({
         ticket_id: ticketId,
         sender_role: 'system',
         message: `🤖 [AUTO] Status Transaksi: ${transaction.status.toUpperCase()}.\n\n⚠️ Sistem tidak dapat refund otomatis karena status bukan GAGAL.\nMohon tunggu admin manusia untuk double-check.`
       });

       await (supabase as any)
         .from('tickets')
         .update({ priority: 'high', status: 'open' }) // Ensure open and high priority
         .eq('id', ticketId);
         
       return { success: true, message: 'Escalated to Admin', actionTaken: 'ESCALATED' };
    }
  }
}
EOF

# 2. Create Server Action
echo ">>> Creating src/app/actions/ticket-refund.ts..."
cat << 'EOF' > src/app/actions/ticket-refund.ts
'use server';

import { SmartRefundSystem } from '@/lib/smart-refund.ts';
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
EOF

echo ">>> Setup Complete!"
echo "Run 'npm run typecheck' to verify."
