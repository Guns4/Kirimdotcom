-- Add fields for simple link escrow & disputes
ALTER TABLE public.escrow_transactions 
ADD COLUMN IF NOT EXISTS item_name TEXT DEFAULT 'Barang Fisik',
ADD COLUMN IF NOT EXISTS auto_release_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_disputed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS dispute_reason TEXT;

-- Update status enum if strictly constrained, or just handle logic in app
-- Assuming varchar(30) so we can insert 'disputed' freely.

-- Function to file dispute
DROP FUNCTION IF EXISTS file_dispute(UUID, TEXT, UUID);
CREATE OR REPLACE FUNCTION file_dispute(
  p_escrow_id UUID,
  p_reason TEXT,
  p_actor_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.escrow_transactions
  SET is_disputed = TRUE,
      dispute_reason = p_reason,
      status = 'disputed',
      updated_at = NOW()
  WHERE id = p_escrow_id 
  AND (buyer_id = p_actor_id OR seller_id = p_actor_id); -- Only parties can dispute
  
  IF FOUND THEN
    INSERT INTO public.escrow_history (escrow_id, event_type, description, actor_id, actor_type)
    VALUES (p_escrow_id, 'dispute_filed', p_reason, p_actor_id, 'user');
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
