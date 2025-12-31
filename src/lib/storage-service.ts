import { createClient } from '@/utils/supabase/client';

export const PLANS = {
  FREE: { limit: 50 * 1024 * 1024, name: 'Free Plan', price: 0 },
  PREMIUM: {
    limit: 10 * 1024 * 1024 * 1024,
    name: 'Cloud+ (10GB)',
    price: 10000,
  },
};

export const StorageService = {
  /**
   * Check if user has enough space
   */
  async checkQuota(fileSize: number): Promise<boolean> {
    const supabase: any = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('profiles')
      .select('storage_used, storage_limit')
      .eq('id', user.id)
      .single();

    if (!data) return true; // Default allow if no profile found (optimistic)

    return data.storage_used + fileSize <= data.storage_limit;
  },

  /**
   * Update usage after upload
   */
  async recordUpload(fileSize: number) {
    const supabase: any = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.rpc('increment_storage_used', {
      user_id: user.id,
      bytes: fileSize,
    });
  },

  /**
   * Upgrade to Premium (Mock Payment)
   */
  async upgradeToPremium() {
    const supabase: any = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not logged in');

    // 1. Check Wallet Balance (TODO: Implement actual wallet check)
    // const hasBalance = await WalletService.checkBalance(user.id, PLANS.PREMIUM.price);
    // if (!hasBalance) throw new Error('Saldo tidak mencukupi');

    // 2. Mock Deduction & Upgrade
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: 'PREMIUM',
        storage_limit: PLANS.PREMIUM.limit,
      })
      .eq('id', user.id);

    if (error) throw error;

    return { success: true };
  },
};
