import { NextResponse } from 'next/server';
import { processRepayment } from '@/lib/paylater';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    // This endpoint would be called by Topup webhook or COD settlement process
    const mb = await request.json();
    const { userId, amount } = mb;

    const repaid = await processRepayment(userId, amount);

    return NextResponse.json({
        success: true,
        repaid_amount: repaid,
        message: repaid > 0 ? `Automatically deducted Rp ${repaid} for PayLater debt` : 'No debt found'
    });
}
