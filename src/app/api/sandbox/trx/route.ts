import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, api_key } = body;

        // 1. Validate Sandbox Key
        if (!api_key || !api_key.startsWith('sb_')) {
            return NextResponse.json({
                status: 'error',
                message: 'Invalid Sandbox Key. Must start with sb_'
            }, { status: 401 });
        }

        // 2. Deterministic Sandbox Logic
        // Partners can test different scenarios based on the amount sent.

        // Scenario: SUCCESS
        if (amount === 500) {
            return NextResponse.json({
                status: 'success',
                trx_id: `sb_trx_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                message: 'Transaction Successful (Mock)',
                data: {
                    balance_after: 999999999 // Unlimited balance
                }
            });
        }

        // Scenario: FAILED
        if (amount === 501) {
            return NextResponse.json({
                status: 'failed',
                message: 'Insufficient Balance (Mock)'
            }, { status: 400 });
        }

        // Scenario: PENDING
        if (amount === 502) {
            return NextResponse.json({
                status: 'pending',
                message: 'Transaction is processing (Mock)'
            }, { status: 202 });
        }

        // Default Success for other amounts
        return NextResponse.json({
            status: 'success',
            trx_id: `sb_trx_${Date.now()}`,
            message: 'Transaction Successful (Default Mock)'
        });

    } catch (e) {
        return NextResponse.json({ status: 'error', message: 'Bad Request' }, { status: 400 });
    }
}
