import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    const { ledger_entry_id } = await request.json();
    const supabase = createClient();

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
        const invoiceNum = `INV/${new Date().getFullYear()}/${ledger_entry_id.slice(0, 8)}`.toUpperCase();
        const content = `INVOICE ${invoiceNum}\nAmount: ${entry.amount}\nDate: ${new Date().toISOString()}`;
        const buffer = Buffer.from(content, 'utf-8');

        // 3. Upload to Storage
        const filePath = `${userId}/${invoiceNum}.txt`; // Using .txt for demo, use .pdf in prod
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
