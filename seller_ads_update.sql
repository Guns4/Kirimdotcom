-- Extend ad_campaigns for Self-Service Features
ALTER TABLE public.ad_campaigns
ADD COLUMN IF NOT EXISTS targeting_couriers TEXT[], -- ['jne', 'jnt'] or NULL for all
ADD COLUMN IF NOT EXISTS targeting_locations TEXT[], -- ['jakarta'] or NULL for all
ADD COLUMN IF NOT EXISTS current_balance DECIMAL(12, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS cost_per_view DECIMAL(10, 2) DEFAULT 100.00;

-- Update track_ad_impression to handle budget deduction
CREATE OR REPLACE FUNCTION track_ad_impression_with_budget(
  p_campaign_id UUID,
  p_viewer_ip VARCHAR,
  p_page_url TEXT
) RETURNS VOID AS $$
DECLARE
  v_details RECORD;
BEGIN
  -- Get current balance & cpv
  SELECT current_balance, cost_per_view, status INTO v_details
  FROM public.ad_campaigns WHERE id = p_campaign_id;

  -- Only track if active
  IF v_details.status = 'active' THEN
     -- Insert impression
     INSERT INTO public.ad_impressions (campaign_id, viewer_ip, page_url)
     VALUES (p_campaign_id, p_viewer_ip, p_page_url);

     -- Update stats and deduct balance
     UPDATE public.ad_campaigns
     SET total_impressions = total_impressions + 1,
         current_balance = current_balance - cost_per_view,
         status = CASE 
            WHEN (current_balance - cost_per_view) <= 0 THEN 'completed' 
            ELSE status 
         END,
         updated_at = NOW()
     WHERE id = p_campaign_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
