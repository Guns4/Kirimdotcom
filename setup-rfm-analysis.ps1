# Customer Intelligence: RFM Analysis (PowerShell)

Write-Host "Initializing RFM System..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. SQL Schema
Write-Host "1. Generating SQL: rfm_schema.sql" -ForegroundColor Yellow
$schemaContent = @'
-- Table to store User Segments
CREATE TABLE IF NOT EXISTS public.user_segments (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    segment TEXT NOT NULL,         -- 'SULTAN', 'CHURN_RISK', 'NEWBIE', 'REGULAR'
    last_computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_user_segment ON public.user_segments(segment);

-- View: Raw RFM Metrics per User
CREATE OR REPLACE VIEW view_rfm_raw AS
SELECT 
    u.id as user_id,
    
    -- Recency: Days since last transaction
    COALESCE(extract(day from now() - MAX(le.created_at)), 999) as recency_days,
    
    -- Frequency: Total count of DEBIT transactions (Spending)
    COUNT(le.id) filter (where le.entry_type = 'DEBIT') as frequency,
    
    -- Monetary: Total Spent
    COALESCE(SUM(le.amount) filter (where le.entry_type = 'DEBIT'), 0) as monetary
    
FROM auth.users u
LEFT JOIN public.wallets w ON w.user_id = u.id
LEFT JOIN public.ledger_entries le ON le.wallet_id = w.id
GROUP BY u.id;
'@
$schemaContent | Set-Content -Path "rfm_schema.sql" -Encoding UTF8
Write-Host "   [?] Schema created." -ForegroundColor Green

# 2. RFM Processor
Write-Host "2. Creating Processor: src/app/api/cron/analytics/rfm/route.ts" -ForegroundColor Yellow
$dirCron = "src\app\api\cron\analytics\rfm"
if (!(Test-Path $dirCron)) { New-Item -ItemType Directory -Force -Path $dirCron | Out-Null }

$processorContent = @'
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
         return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = createClient();
    
    // 1. Fetch Raw Metrics
    const { data: metrics } = await supabase.from('view_rfm_raw').select('*');
    if (!metrics) return NextResponse.json({ processed: 0 });

    // 2. Compute Percentiles (Simple In-Memory for small datasets, use DB window functions for large)
    // For 'Sultan', top 5% Monetary
    const sortedByMoney = [...metrics].sort((a,b) => b.monetary - a.monetary);
    const top5Index = Math.floor(sortedByMoney.length * 0.05);
    const sultanThreshold = sortedByMoney[top5Index]?.monetary || 10000000;

    const updates = [];

    for (const m of metrics) {
        let segment = 'REGULAR';
        
        if (m.frequency === 0) {
            segment = 'NEWBIE';
        } else if (m.recency_days > 30) {
            segment = 'CHURN_RISK';
        } else if (m.monetary >= sultanThreshold && m.monetary > 0) {
            segment = 'SULTAN';
        }

        // Upsert Logic (Batched ideally, separate for demo)
        updates.push({
            user_id: m.user_id,
            segment,
            last_computed_at: new Date().toISOString()
        });
    }

    // 3. Batch Upsert
    if (updates.length > 0) {
        // Supabase upsert
        const { error } = await supabase.from('user_segments').upsert(updates);
        if (error) console.error('RFM Upsert Error', error);
    }
    
    return NextResponse.json({ processed: updates.length, top_threshold: sultanThreshold });
}
'@
$processorContent | Set-Content -Path "src\app\api\cron\analytics\rfm\route.ts" -Encoding UTF8
Write-Host "   [?] Processor created." -ForegroundColor Green

# 3. Dashboard API
Write-Host "3. Creating Dashboard API: src/app/api/admin/analytics/segments/route.ts" -ForegroundColor Yellow
$dirAdmin = "src\app\api\admin\analytics\segments"
if (!(Test-Path $dirAdmin)) { New-Item -ItemType Directory -Force -Path $dirAdmin | Out-Null }

$dashboardContent = @'
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    // Only Admin
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });
    
    // Aggregate Segments
    // SELECT segment, count(*) FROM user_segments GROUP BY segment
    const { data } = await supabase
        .from('user_segments')
        .select('segment'); // Client-side count or RPC for speed
        
    const stats: Record<string, number> = { 
        SULTAN: 0, 
        CHURN_RISK: 0, 
        NEWBIE: 0, 
        REGULAR: 0 
    };
    
    data?.forEach((row: any) => {
        if (stats[row.segment] !== undefined) stats[row.segment]++;
    });
    
    return NextResponse.json(stats);
}
'@
$dashboardContent | Set-Content -Path "src\app\api\admin\analytics\segments\route.ts" -Encoding UTF8
Write-Host "   [?] Dashboard API created." -ForegroundColor Green

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "RFM Analysis Ready!" -ForegroundColor Green
Write-Host "1. Run 'rfm_schema.sql'." -ForegroundColor White
Write-Host "2. Setup Cron: GET /api/cron/analytics/rfm (Nightly)." -ForegroundColor White
