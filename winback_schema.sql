-- Add Campaign tracking to User Segments
ALTER TABLE public.user_segments ADD COLUMN IF NOT EXISTS last_campaign_at TIMESTAMP WITH TIME ZONE;

-- Voucher Table
CREATE TABLE IF NOT EXISTS public.marketing_vouchers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    
    discount_amount DECIMAL(19,4) NOT NULL,
    max_usage INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,
    
    is_redeemed BOOLEAN GENERATED ALWAYS AS (used_count >= max_usage) STORED,
    
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger: Auto-Update Segment to 'RE_ACTIVATED' upon Redemption
CREATE OR REPLACE FUNCTION reactivate_user_on_redemption() RETURNS TRIGGER AS $$
BEGIN
    -- If voucher is now redeemed
    IF NEW.used_count > OLD.used_count AND NEW.used_count >= NEW.max_usage THEN
        -- Update the User Segment
        UPDATE public.user_segments
        SET segment = 'RE_ACTIVATED',
            last_computed_at = NOW()
        WHERE user_id = NEW.user_id 
          AND segment = 'CHURN_RISK'; -- Only reactivate if they were pending churn
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_reactivate_user ON public.marketing_vouchers;
CREATE TRIGGER tr_reactivate_user
AFTER UPDATE ON public.marketing_vouchers
FOR EACH ROW EXECUTE FUNCTION reactivate_user_on_redemption();
