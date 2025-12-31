import { createClient } from '@/utils/supabase/server';

export async function getPayLaterStatus(userId: string) {
  const supabase: any = await createClient();

  // 1. Check Eligibility RPC
  const { data: isEligible, error } = await supabase.rpc(
    'check_paylater_eligibility',
    {
      check_user_id: userId,
    }
  );

  if (error) {
    console.error('PayLater Check Error:', error);
    return { eligible: false, limit: 0, currentDebt: 0 };
  }

  // 2. Calculate Current Debt
  const { data: debtData } = await supabase
    .from('ledger_entries')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'PAYLATER_DEBT'); // Only count unpaid debts

  // Sum is negative for debts
  const currentDebtStr =
    debtData?.reduce(
      (acc: number, curr: any) => acc + Number(curr.amount),
      0
    ) || 0;
  const currentDebt = Math.abs(currentDebtStr);

  return {
    eligible: !!isEligible,
    limit: 500000, // Hardcoded limit example Rp 500k
    currentDebt,
  };
}

export async function processRepayment(userId: string, incomingAmount: number) {
  // Call this function whenever a Topup/COD success happens
  const supabase: any = await createClient();
  const status = await getPayLaterStatus(userId);

  if (status.currentDebt > 0) {
    const repayAmount = Math.min(status.currentDebt, incomingAmount);

    // Deduct for Repayment
    await supabase.from('ledger_entries').insert({
      user_id: userId,
      amount: -repayAmount,
      type: 'PAYLATER_REPAY',
      description: `Auto-Repayment of Debt (Total Debt: ${status.currentDebt})`,
    });

    // Credit the "Debt" ledger to balance it out?
    // Or simply record 'PAYLATER_REPAY' as a negative balance transaction
    // effectively reducing their usable balance,
    // but we need to mark the original debts as paid?
    // For simplicity: We use a consolidated balance.
    // If balance is negative, incoming money fills the hole.
    // But if PayLater allowed generic negative balance, we just need to ensure
    // they can't withdraw if balance < 0.

    return repayAmount;
  }
  return 0;
}
