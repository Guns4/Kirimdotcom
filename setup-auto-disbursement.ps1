# Automation: Auto-Disbursement (PowerShell)

Write-Host "Initializing Auto Payout System..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Helper Logic: Check Fraud (Mock)
Write-Host "1. Creating Utils: src\lib\fraud-check.ts" -ForegroundColor Yellow
$dirLib = "src\lib"
if (!(Test-Path $dirLib)) { New-Item -ItemType Directory -Force -Path $dirLib | Out-Null }

$fraudContent = @'
export async function isUserFlagged(userId: string): Promise<boolean> {
    // In production, check 'profiles.is_fraud' or similar in database
    console.log(`[FRAUD_CHECK] Auditing user: ${userId}`);
    return false; // Default safe for demo
}
'@
$fraudContent | Set-Content -Path "src\lib\fraud-check.ts" -Encoding UTF8
Write-Host "   [?] Fraud utility created." -ForegroundColor Green

# 2. Main API for Disbursement
Write-Host "2. Creating API: src\app\api\finance\disburse\route.ts" -ForegroundColor Yellow
$dirDisburse = "src\app\api\finance\disburse"
if (!(Test-Path $dirDisburse)) { New-Item -ItemType Directory -Force -Path $dirDisburse | Out-Null }

$disburseContent = @'
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isUserFlagged } from '@/lib/fraud-check';

export async function POST(request: Request) {
    // Protected by CRON_SECRET for automated jobs
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
         return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const { withdrawal_request_id } = await request.json();
        const supabase = await createClient();

        // 1. Fetch Request
        const { data: trx } = await supabase
            .from('withdrawal_requests')
            .select('*')
            .eq('id', withdrawal_request_id)
            .single();

        if (!trx || trx.status !== 'REQUESTED') {
            return NextResponse.json({ error: 'Invalid transaction status or not found' }, { status: 400 });
        }

        // 2. Rule Engine (Fraud & Limits)
        const isFraud = await isUserFlagged(trx.user_id);
        if (isFraud) {
             await supabase.from('withdrawal_requests')
                .update({ status: 'REJECTED', notes: 'Fraud Suspected' })
                .eq('id', trx.id);
             return NextResponse.json({ status: 'REJECTED', reason: 'Fraud' });
        }

        // High Value Check (Manual Approval Required > Rp 500k)
        if (trx.amount > 500000) {
             await supabase.from('withdrawal_requests')
                .update({ status: 'PENDING_APPROVAL', notes: 'High value transaction' })
                .eq('id', trx.id);
             return NextResponse.json({ status: 'PENDING_APPROVAL', amount: trx.amount });
        }

        // 3. Execute Transfer (Idempotent Mock)
        console.log(`[DISBURSE] Processing ID: ${trx.id} | Amount: ${trx.amount}`);
        
        // Final Status Update
        await supabase
            .from('withdrawal_requests')
            .update({ 
                status: 'COMPLETED',
                processed_at: new Date().toISOString()
            })
            .eq('id', trx.id);

        return NextResponse.json({ 
            success: true, 
            status: 'COMPLETED', 
            id: trx.id 
        });

    } catch (error: any) {
        console.error('[DISBURSE_ERROR]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
'@
$disburseContent | Set-Content -Path "src\app\api\finance\disburse\route.ts" -Encoding UTF8
Write-Host "   [?] Disbursement API created." -ForegroundColor Green

# 3. Webhook for Async Updates
Write-Host "3. Creating Webhook: src\app\api\webhooks\disbursement\route.ts" -ForegroundColor Yellow
$dirWebhook = "src\app\api\webhooks\disbursement"
if (!(Test-Path $dirWebhook)) { New-Item -ItemType Directory -Force -Path $dirWebhook | Out-Null }

$webhookContent = @'
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    const body = await request.json();
    const supabase = await createClient();

    // Mapping Gateway Payload
    const { external_id, status } = body; 

    if (status === 'SUCCESS' || status === 'COMPLETED') {
        await supabase
            .from('withdrawal_requests')
            .update({ status: 'COMPLETED', processed_at: new Date().toISOString() })
            .eq('id', external_id);
    } 
    else if (status === 'FAILED') {
        const { data: trx } = await supabase
            .from('withdrawal_requests')
            .select('*')
            .eq('id', external_id)
            .single();
        
        if (trx) {
            await supabase.from('withdrawal_requests').update({ status: 'FAILED' }).eq('id', external_id);
            
            // AUTOMATIC REFUND TO LEDGER
             await supabase.from('ledger_entries').insert({
                 amount: trx.amount,
                 entry_type: 'CREDIT',
                 description: 'Refund: Withdrawal Failed (Auto)',
                 reference_id: trx.id,
                 metadata: { source: 'disbursement_webhook', reason: 'gateway_failure' }
             });
        }
    }

    return NextResponse.json({ received: true });
}
'@
$webhookContent | Set-Content -Path "src\app\api\webhooks\disbursement\route.ts" -Encoding UTF8
Write-Host "   [?] Webhook handler created." -ForegroundColor Green

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Auto Disbursement System Configured!" -ForegroundColor Green
Write-Host "API Endpoint: POST /api/finance/disburse" -ForegroundColor White
Write-Host "Webhook: POST /api/webhooks/disbursement" -ForegroundColor White
