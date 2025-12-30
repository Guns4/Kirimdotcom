# Automation: Financial Reports (PowerShell)

Write-Host "Initializing Financial Reports System..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. SQL Schema
Write-Host "1. Generating SQL: financial_reports.sql" -ForegroundColor Yellow
$schemaContent = @'
-- Table to track operational expenses (Servers, APIs, Salaries)
CREATE TABLE IF NOT EXISTS public.operational_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    amount DECIMAL(19,4) NOT NULL,
    category TEXT NOT NULL, -- 'HOSTING', 'API_COST', 'MARKETING'
    description TEXT,
    
    expense_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VIew: Monthly P&L (Profit & Loss)
-- Aggregates Revenue from System Wallet vs Expenses
CREATE OR REPLACE VIEW view_monthly_pnl AS
SELECT
    TO_CHAR(DATE_TRUNC('month', le.created_at), 'YYYY-MM') AS month_str,
    
    -- Revenue (From System Revenue Wallet)
    COALESCE(SUM(CASE 
        WHEN w.slug = 'WALLET_SYSTEM_REVENUE' AND le.entry_type = 'CREDIT' THEN le.amount 
        ELSE 0 
    END), 0) AS total_revenue,
    
    -- Expenses (From operational_expenses table)
    COALESCE((
        SELECT SUM(amount) 
        FROM public.operational_expenses oe 
        WHERE TO_CHAR(DATE_TRUNC('month', oe.expense_date), 'YYYY-MM') = TO_CHAR(DATE_TRUNC('month', le.created_at), 'YYYY-MM')
    ), 0) AS total_expenses,
    
    -- Net Profit
    COALESCE(SUM(CASE 
        WHEN w.slug = 'WALLET_SYSTEM_REVENUE' AND le.entry_type = 'CREDIT' THEN le.amount 
        ELSE 0 
    END), 0) - 
    COALESCE((
        SELECT SUM(amount) 
        FROM public.operational_expenses oe 
        WHERE TO_CHAR(DATE_TRUNC('month', oe.expense_date), 'YYYY-MM') = TO_CHAR(DATE_TRUNC('month', le.created_at), 'YYYY-MM')
    ), 0) AS net_profit

FROM public.ledger_entries le
JOIN public.wallets w ON le.wallet_id = w.id
WHERE w.slug = 'WALLET_SYSTEM_REVENUE'
GROUP BY 1
ORDER BY 1 DESC;
'@
$schemaContent | Set-Content -Path "financial_reports.sql" -Encoding UTF8
Write-Host "   [?] Schema created." -ForegroundColor Green

# 2. Report Generator API
Write-Host "2. Creating API: src\app\api\cron\report\route.ts" -ForegroundColor Yellow
$dirApi = "src\app\api\cron\report"
if (!(Test-Path $dirApi)) { New-Item -ItemType Directory -Force -Path $dirApi | Out-Null }

$routeContent = @'
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { adminAlert } from '@/lib/admin-alert';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
         return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = await createClient();
    
    // 1. Fetch Last Month's Data
    const { data: report } = await supabase
        .from('view_monthly_pnl')
        .select('*')
        .limit(1)
        .single();

    if (!report) {
        return NextResponse.json({ message: 'No data available' });
    }

    // 2. Generate Summary
    const reportSummary = `Revenue: Rp ${report.total_revenue.toLocaleString()} | Expenses: Rp ${report.total_expenses.toLocaleString()} | Net Profit: Rp ${report.net_profit.toLocaleString()}`;

    // 3. Send Alert
    console.log('[REPORT GENERATED]', report);
    await adminAlert.info(
        `Monthly Financial Report - ${report.month_str}`, 
        reportSummary,
        {
            revenue: report.total_revenue,
            expenses: report.total_expenses,
            profit: report.net_profit
        }
    );

    return NextResponse.json({ success: true, report });
}
'@
$routeContent | Set-Content -Path "src\app\api\cron\report\route.ts" -Encoding UTF8
Write-Host "   [?] API created." -ForegroundColor Green

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Financial Reporting Ready!" -ForegroundColor Green
Write-Host "1. Run 'financial_reports.sql'" -ForegroundColor White
Write-Host "2. Setup Cron: GET /api/cron/report (Monthly)" -ForegroundColor White
