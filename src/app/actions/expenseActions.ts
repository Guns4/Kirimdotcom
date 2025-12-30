'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addExpense(data: {
  amount: number;
  category: string;
  description: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // @ts-ignore: Types not generated yet
  await supabase.from('expenses').insert({
    user_id: user.id,
    amount: data.amount,
    category: data.category,
    description: data.description,
    date: new Date().toISOString().split('T')[0],
  });

  revalidatePath('/dashboard/expenses');
}

export async function getMonthlyReport(month: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const startDate = `${month}-01`;
  const endDate = `${month}-31`; // Simplified, works for postgres date logic usuallly

  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, category')
    .eq('user_id', user?.id as string)
    .gte('date', startDate)
    .lte('date', endDate);

  return expenses || [];
}
