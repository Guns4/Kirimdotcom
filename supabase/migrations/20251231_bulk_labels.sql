-- Bulk Labels Schema
-- To track printed manifests and batches

CREATE TABLE IF NOT EXISTS public.shipment_batches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    batch_name TEXT,
    total_orders INTEGER DEFAULT 0,
    couriers TEXT[], -- List of couriers involved
    status TEXT DEFAULT 'CREATED', -- CREATED, PRINTED, MANIFESTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.shipment_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own batches" ON public.shipment_batches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own batches" ON public.shipment_batches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own batches" ON public.shipment_batches FOR UPDATE USING (auth.uid() = user_id);
