'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getUserDetails(userId: string) {
  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from('profiles') // Assuming 'profiles' table exists, or auth.users join
    .select('*') // Adjust fields based on actual schema: id, email, full_name, etc.
    .eq('id', userId)
    .single();

  // Fallback if profiles not used or to get email
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);

  // Get Wallet Balance
  const { data: wallet } = await supabase
    .from('wallets') // user_wallets or similar
    .select('balance')
    .eq('user_id', userId)
    .single();

  return {
    profile: user || {},
    email: authUser?.user?.email || 'Unknown',
    balance: wallet?.balance || 0,
  };
}

export async function topupUserWallet(userId: string, amount: number) {
  const supabase = await createClient();

  // Insert Ledger Entry (Trigger should handle balance update)
  const { error } = await supabase.from('ledger_entries').insert({
    user_id: userId,
    amount: amount,
    type: 'TOPUP',
    description: 'Manual Topup via Admin Scanner',
    status: 'COMPLETED',
  });

  if (error) throw error;
  revalidatePath(`/admin/mobile/users/${userId}`);
  return { success: true };
}

export async function banUser(userId: string) {
  const supabase = await createClient();

  // In Supabase, usually updating auth.users require service role or admin api
  // Here we might verify if we update a public profile status
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: '876000h', // 100 years
  });

  if (error) throw error;
  revalidatePath(`/admin/mobile/users/${userId}`);
  return { success: true };
}

export async function resetUserPassword(userId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.admin.getUserById(userId);
  if (!user?.email) throw new Error('User has no email');

  const { error } = await supabase.auth.resetPasswordForEmail(user.email);

  if (error) throw error;
  return { success: true };
}
