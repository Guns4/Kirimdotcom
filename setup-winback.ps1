# Retention: Winback Campaign (PowerShell)

Write-Host "Initializing Winback System..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. SQL Schema
Write-Host "1. Generating SQL: winback_schema.sql" -ForegroundColor Yellow
$schemaContent = @'
-- Add Campaign tracking to User Segments
ALTER TABLE public.user_segments ADD COLUMN IF NOT EXISTS last_campaign_at TIMESTAMP WITH TIME ZONE;

-- Voucher Table
CREATE TABLE IF NOT EXISTS public.marketing_vouchers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    
    discount_amount DECIMAL(19,4) NOT NULL,
    max_usage INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,
    
    is_redeemed BOOLEAN GENERATED ALWAYS AS (used_count >= max_usage) STORED,
    
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger: Auto-Update Segment to 'RE_ACTIVATED' upon Redemption
CREATE OR REPLACE FUNCTION reactivate_user_on_redemption() RETURNS TRIGGER AS $$
BEGIN
    -- If voucher is now redeemed
    IF NEW.used_count > OLD.used_count AND NEW.used_count >= NEW.max_usage THEN
        -- Update the User Segment
        UPDATE public.user_segments
        SET segment = 'RE_ACTIVATED',
            last_computed_at = NOW()
        WHERE user_id = NEW.user_id 
          AND segment = 'CHURN_RISK'; -- Only reactivate if they were pending churn
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_reactivate_user ON public.marketing_vouchers;
CREATE TRIGGER tr_reactivate_user
AFTER UPDATE ON public.marketing_vouchers
FOR EACH ROW EXECUTE FUNCTION reactivate_user_on_redemption();
'@
$schemaContent | Set-Content -Path "winback_schema.sql" -Encoding UTF8
Write-Host "   [?] Schema created." -ForegroundColor Green

# 2. Campaign Logic API
Write-Host "2. Creating API: src/app/api/cron/marketing/winback/route.ts" -ForegroundColor Yellow
$dirApi = "src\app\api\cron\marketing\winback"
if (!(Test-Path $dirApi)) { New-Item -ItemType Directory -Force -Path $dirApi | Out-Null }

$routeContent = @'
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendAdminAlert } from '@/lib/admin-alert'; // Reusing alerter for demo

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
         return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = createClient();
    
    // 1. Find Targets
    // CHURN_RISK, and haven't received a campaign in 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: targets } = await supabase
        .from('user_segments')
        .select('user_id')
        .eq('segment', 'CHURN_RISK')
        .or(`last_campaign_at.is.null,last_campaign_at.lt.${thirtyDaysAgo.toISOString()}`)
        .limit(50); // Batch size

    if (!targets || targets.length === 0) {
        return NextResponse.json({ processed: 0, message: 'No targets found' });
    }

    let sentCount = 0;

    for (const target of targets) {
        // 2. Generate Voucher
        const code = `WB-${target.user_id.split('-')[0].toUpperCase()}`; // Simple Code
        const expires = new Date();
        expires.setDate(expires.getDate() + 7); // 7 Days expiry

        // Insert Voucher
        const { error } = await supabase.from('marketing_vouchers').upsert({
            user_id: target.user_id,
            code,
            discount_amount: 5000, // Rp 5.000
            max_usage: 1,
            expires_at: expires.toISOString()
        }, { onConflict: 'code' }); // If code exists, skip/update (idempotent)
        
        if (!error) {
            // 3. Mark Campaign Sent
            await supabase.from('user_segments')
                .update({ last_campaign_at: new Date().toISOString() })
                .eq('user_id', target.user_id);
                
            // 4. Mock Send
            // await whatsapp.send(target.user_id, "We miss you! Use " + code);
            console.log(`[WINBACK] Sent ${code} to ${target.user_id}`);
            sentCount++;
        }
    }
    
    if (sentCount > 0) {
        await sendAdminAlert('Winback Campaign Run', `Sent ${sentCount} vouchers to Churn Risk users.`);
    }

    return NextResponse.json({ processed: sentCount, targets: targets.length });
}
'@
$routeContent | Set-Content -Path "src\app\api\cron\marketing\winback\route.ts" -Encoding UTF8
Write-Host "   [?] API created." -ForegroundColor Green

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Winback Campaign Ready!" -ForegroundColor Green
Write-Host "1. Run 'winback_schema.sql'." -ForegroundColor White
Write-Host "2. Setup Cron: GET /api/cron/marketing/winback (Daily)." -ForegroundColor White
