'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveBankAccount(
  bankCode: string,
  accountNumber: string,
  accountName: string
) {
  const supabase = await createClient();

  // 1. Double check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // 2. Insert
  const { error } = await (supabase as any).from('saved_bank_accounts').insert({
    user_id: user.id,
    bank_code: bankCode,
    account_number: accountNumber,
    account_holder_name: accountName,
    is_verified: true,
  });

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/finance');
  return { success: true };
}

export async function getSavedAccounts() {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from('saved_bank_accounts')
    .select('*');
  return data || [];
}
