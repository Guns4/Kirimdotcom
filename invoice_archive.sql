-- Table to link Ledger Entries to PDF Files
CREATE TABLE IF NOT EXISTS public.transaction_invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    ledger_entry_id UUID REFERENCES public.ledger_entries(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id), -- Denormalized for searching
    
    invoice_number TEXT UNIQUE NOT NULL, -- e.g. INV/2025/00001
    storage_path TEXT NOT NULL,         -- Supabase Storage Path
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for Fast Search
CREATE INDEX IF NOT EXISTS idx_invoices_ledger ON public.transaction_invoices(ledger_entry_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.transaction_invoices(invoice_number);

-- Storage Bucket (SQL for Supabase Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('secure-invoices', 'secure-invoices', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for Storage (Strict)
CREATE POLICY "Admin Upload Invoices"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'secure-invoices');

CREATE POLICY "Users View Own Invoices"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'secure-invoices' 
    AND (auth.uid()::text = (storage.foldername(name))[1]) -- Structure: user_id/invoice.pdf
);
