#!/bin/bash

# =============================================================================
# Audit Trail: Invoice Archive
# =============================================================================

echo "Initializing Invoice Archivist..."
echo "================================================="

# 1. SQL Schema (Tables & Storage)
echo "1. Generating SQL: invoice_archive.sql"
cat <<EOF > invoice_archive.sql
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
-- Note: Must be run in Dashboard if SQL editor doesn't support Storage API
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

EOF

# 2. Generator API
echo "2. Creating API: src/app/api/admin/invoices/generate/route.ts"
mkdir -p src/app/api/admin/invoices/generate

cat <<EOF > src/app/api/admin/invoices/generate/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    const { ledger_entry_id } = await request.json();
    const supabase = await createClient();

    try {
        // 1. Fetch Ledger Data
        const { data: entry } = await supabase
            .from('ledger_entries')
            .select('*, wallets(user_id)')
            .eq('id', ledger_entry_id)
            .single();

        if (!entry) throw new Error('Entry not found');
        
        const userId = entry.wallets?.user_id; // Assuming user owned wallet
        if (!userId) throw new Error('No User associated with wallet');

        // 2. Generate PDF (Mock Buffer)
        // In Prod: use 'jspdf' or 'pdfkit' or 'react-pdf'
        const invoiceNum = \`INV/\${new Date().getFullYear()}/\${ledger_entry_id.slice(0, 8)}\`.toUpperCase();
        const content = \`INVOICE \${invoiceNum}\nAmount: \${entry.amount}\nDate: \${new Date().toISOString()}\`;
        const buffer = Buffer.from(content, 'utf-8');

        // 3. Upload to Storage
        const filePath = \`\${userId}/\${invoiceNum}.txt\`; // Using .txt for demo, use .pdf in prod
        const { error: uploadError } = await supabase.storage
            .from('secure-invoices')
            .upload(filePath, buffer, { contentType: 'text/plain', upsert: true });

        if (uploadError) throw new Error(uploadError.message);

        // 4. Record in DB
        await supabase.from('transaction_invoices').insert({
            ledger_entry_id,
            user_id: userId,
            invoice_number: invoiceNum,
            storage_path: filePath
        });

        return NextResponse.json({ success: true, invoice_number: invoiceNum, path: filePath });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
EOF

echo ""
echo "================================================="
echo "Invoice Archive Ready!"
echo "1. Run 'invoice_archive.sql'."
echo "2. Call POST /api/admin/invoices/generate { ledger_entry_id: ... } to archive."
