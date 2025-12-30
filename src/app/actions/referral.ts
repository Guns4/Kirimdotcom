'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function captureReferral(referralCode: string) {
  // Simple: Store in cookie for 30 days
  (await cookies()).set('ref_code', referralCode, { maxAge: 60 * 60 * 24 * 30 });
}

export async function assignReferrer(userId: string) {
  const supabase = await createClient();
  const refCode = (await cookies()).get('ref_code')?.value;
  
  if (!refCode) return;

  // Find referrer
  const { data: referrer } = await supabase
     .from('user_referrals')
     .select('user_id')
     .eq('referral_code', refCode)
     .single();
     
  if (referrer) {
      await supabase.from('user_referrals').update({
          referred_by: referrer.user_id
      }).eq('user_id', userId);
      
      // Clear cookie
      (await cookies()).delete('ref_code');
  }
}

export async function createReferralProfile(userId: string, name: string) {
    const supabase = await createClient();
    // Using Postgres Function to generate code
    const { data: code } = await supabase.rpc('generate_referral_code', { p_name: name || 'USER' });
    
    if (code) {
        await supabase.from('user_referrals').insert({
            user_id: userId,
            referral_code: code
        });
    }
}
