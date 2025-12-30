'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getReports() {
  const supabase = await createClient();
  const { data } = await supabase.from('business_reports').select('*').eq('is_active', true);
  
  // Check ownership
  const { data: { user } } = await supabase.auth.getUser();
  let ownedIds: string[] = [];
  
  if (user) {
     const { data: purchases } = await supabase.from('report_purchases').select('report_id').eq('user_id', user.id);
     if (purchases) ownedIds = purchases.map(p => p.report_id);
  }

  return data?.map(r => ({
     ...r,
     isOwned: ownedIds.includes(r.id)
  })) || [];
}

export async function purchaseReport(reportId: string, price: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Login required' };

  // 1. Debit Wallet
  const { data: wallet } = await supabase.from('wallets').select('id, balance').eq('user_id', user.id).single();
  if (!wallet || Number(wallet.balance) < price) return { error: 'Saldo tidak mencukupi.' };

  // Atomic Ledger Insert (DEBIT)
  const { error: debitError } = await supabase.from('ledger_entries').insert({
     wallet_id: wallet.id,
     amount: price,
     entry_type: 'DEBIT',
     description: 'Purchase Data Report',
     reference_id: reportId
  });

  if (debitError) return { error: 'Gagal memproses pembayaran.' };

  // 2. Record Purchase
  const { error: purchError } = await supabase.from('report_purchases').insert({
     user_id: user.id,
     report_id: reportId,
     price_paid: price
  });

  if (purchError) return { error: 'Gagal mencatat pembelian. Hubungi CS.' };
  
  revalidatePath('/business/data');
  return { success: true };
}

export async function getReportData(reportId: string) {
   const supabase = await createClient();
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) return null;

   // Verify ownership
   const { data: purchase } = await supabase
      .from('report_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('report_id', reportId)
      .single();

   if (!purchase) return null; // Access Denied

   // Return Dummy Data derived from View
   const { data: trends } = await supabase.from('view_anonymized_trends').select('*').limit(50);
   return trends;
}
