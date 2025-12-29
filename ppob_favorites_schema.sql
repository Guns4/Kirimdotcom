CREATE TABLE IF NOT EXISTS public.user_favorites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    type text NOT NULL, -- PLN, PULSA, PDAM, etc.
    destination_number text NOT NULL,
    provider_name text, -- Telkomsel, XL, etc.
    alias text,
    count_trx integer DEFAULT 1,
    last_used_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, type, destination_number)
);

-- Function to auto-save/update favorites after transaction
CREATE OR REPLACE FUNCTION public.upsert_favorite()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'SUCCESS' THEN
        INSERT INTO public.user_favorites (user_id, type, destination_number, provider_name, last_used_at, count_trx)
        VALUES (NEW.user_id, NEW.product_type, NEW.customer_number, NEW.provider, now(), 1)
        ON CONFLICT (user_id, type, destination_number)
        DO UPDATE SET 
            last_used_at = now(),
            count_trx = user_favorites.count_trx + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger (Assuming 'transactions' table exists)
DROP TRIGGER IF EXISTS trg_save_favorite ON public.transactions;
CREATE TRIGGER trg_save_favorite
AFTER UPDATE ON public.transactions
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'SUCCESS')
EXECUTE FUNCTION public.upsert_favorite();
