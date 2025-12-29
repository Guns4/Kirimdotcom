#!/bin/bash

# =============================================================================
# Passive Growth: Referral Automation
# =============================================================================

echo "Initializing Referral System..."
echo "================================================="

# 1. SQL Schema & Triggers
echo "1. Generating SQL: referral_automation.sql"
cat <<EOF > referral_automation.sql
-- Function to generate code
CREATE OR REPLACE FUNCTION generate_referral_code(p_name TEXT) RETURNS TEXT AS \$\$
DECLARE
  base_code TEXT;
  final_code TEXT;
  exists_flag BOOLEAN;
BEGIN
  -- Normalize name (alphanum only, upper)
  base_code := UPPER(REGEXP_REPLACE(p_name, '[^a-zA-Z0-9]', '', 'g'));
  If LENGTH(base_code) < 3 THEN base_code := 'USER'; END IF;
  
  LOOP
    final_code := 'REF-' || SUBSTRING(base_code, 1, 4) || FLOOR(RANDOM() * 8999 + 1000)::TEXT;
    
    SELECT EXISTS(SELECT 1 FROM user_referrals WHERE referral_code = final_code) INTO exists_flag;
    EXIT WHEN NOT exists_flag;
  END LOOP;
  
  RETURN final_code;
END;
\$\$ LANGUAGE plpgsql;

-- Trigger: Create Referral Profile on User Creation
-- (Note: This assumes we have a public.profiles table or similar to get the name, 
--  otherwise we use email or random)
-- For simplicity in this script, we'll let the application call this, 
-- OR use a trigger on 'profiles' insert if available.

-- REWARD LOGIC: Trigger on Subscription Upgrade
CREATE OR REPLACE FUNCTION process_referral_reward() RETURNS TRIGGER AS \$\$
DECLARE
  v_referrer_id UUID;
  v_reward_amount DECIMAL := 10000;
  v_referrer_wallet_id UUID;
BEGIN
  -- Only trigger if upgrading to Premium (Free -> Pro/Enterprise) 
  -- AND it was not active before (First time upgrade or re-sub)
  -- Or just check 'is_premium' flip
  
  IF NEW.is_premium = true AND (OLD.is_premium = false OR OLD.is_premium IS NULL) THEN
  
      -- 1. Find Referrer
      SELECT referred_by INTO v_referrer_id 
      FROM public.user_referrals 
      WHERE user_id = NEW.user_id;
      
      IF v_referrer_id IS NOT NULL THEN
      
          -- 2. Find Referrer's Wallet
          SELECT id INTO v_referrer_wallet_id 
          FROM public.wallets 
          WHERE user_id = v_referrer_id;
          
          IF v_referrer_wallet_id IS NOT NULL THEN
              -- 3. Credit Reward (Ledger)
              INSERT INTO public.ledger_entries (
                 wallet_id,
                 amount,
                 entry_type,
                 description,
                 reference_id
              ) VALUES (
                 v_referrer_wallet_id,
                 v_reward_amount,
                 'CREDIT',
                 'Referral Bonus: Friend Upgrade',
                 NEW.user_id::TEXT
              );
              
              -- 4. Record Conversion
              INSERT INTO public.referral_conversions (
                 referrer_id,
                 referee_id,
                 amount_paid,
                 commission_earned,
                 status
              ) VALUES (
                 v_referrer_id,
                 NEW.user_id,
                 NEW.price_paid,
                 v_reward_amount,
                 'PAID'
              );
          END IF;
      END IF;
  END IF;
  
  RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

-- Bind Trigger
DROP TRIGGER IF EXISTS tr_referral_reward ON public.user_subscriptions;
CREATE TRIGGER tr_referral_reward
AFTER UPDATE ON public.user_subscriptions
FOR EACH ROW EXECUTE FUNCTION process_referral_reward();

EOF

# 2. Server Action (Registration Helper)
echo "2. Creating Action: src/app/actions/referral.ts"
mkdir -p src/app/actions
cat <<EOF > src/app/actions/referral.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function captureReferral(referralCode: string) {
  // Simple: Store in cookie for 30 days
  cookies().set('ref_code', referralCode, { maxAge: 60 * 60 * 24 * 30 });
}

export async function assignReferrer(userId: string) {
  const supabase = createClient();
  const refCode = cookies().get('ref_code')?.value;
  
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
      cookies().delete('ref_code');
  }
}

export async function createReferralProfile(userId: string, name: string) {
    const supabase = createClient();
    // Using Postgres Function to generate code
    const { data: code } = await supabase.rpc('generate_referral_code', { p_name: name || 'USER' });
    
    if (code) {
        await supabase.from('user_referrals').insert({
            user_id: userId,
            referral_code: code
        });
    }
}
EOF

echo ""
echo "================================================="
echo "Referral System Ready!"
echo "1. Run 'referral_automation.sql'."
echo "2. Frontend: Call 'captureReferral' when user lands with ?ref=..."
echo "3. Backend: Call 'createReferralProfile' & 'assignReferrer' on SignUp."
