-- Function to generate code
CREATE OR REPLACE FUNCTION generate_referral_code(p_name TEXT) RETURNS TEXT AS $$
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
    
    SELECT EXISTS(SELECT 1 FROM public.user_referrals WHERE referral_code = final_code) INTO exists_flag;
    EXIT WHEN NOT exists_flag;
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- REWARD LOGIC: Trigger on Subscription Upgrade
CREATE OR REPLACE FUNCTION process_referral_reward() RETURNS TRIGGER AS $$
DECLARE
  v_referrer_id UUID;
  v_reward_amount DECIMAL := 10000;
  v_referrer_wallet_id UUID;
BEGIN
  -- Only trigger if upgrading to Premium (Free -> Pro/Enterprise) 
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
$$ LANGUAGE plpgsql;

-- Bind Trigger
DROP TRIGGER IF EXISTS tr_referral_reward ON public.user_subscriptions;
CREATE TRIGGER tr_referral_reward
AFTER UPDATE ON public.user_subscriptions
FOR EACH ROW EXECUTE FUNCTION process_referral_reward();
