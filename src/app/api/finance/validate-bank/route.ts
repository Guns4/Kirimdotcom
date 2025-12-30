import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const MOCK_DB: Record<string, string> = {
    '1234567890': 'AHMAD DANI',
    '0987654321': 'SITI AMINAH',
    '1122334455': 'PT SINAR JAYA'
};

export async function POST(request: Request) {
    try {
        const { bank_code, account_number } = await request.json();
        
        if (!bank_code || !account_number) {
            return NextResponse.json({ error: 'Missing bank_code or account_number' }, { status: 400 });
        }

        // MOCK VALIDATION LOGIC
        // In Prod: Call Xendit / Flip / Midtrans Disbursement API
        
        let mockName = MOCK_DB[account_number] || 'BUDI SANTOSO';

        // Return the name for User Confirmation
        return NextResponse.json({ 
            status: 'success', 
            account_name: mockName,
            bank_code,
            account_number
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
