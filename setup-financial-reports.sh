#!/bin/bash

# =============================================================================
# Automation: Financial Reports
# =============================================================================

echo "Initializing Financial Reports System..."
echo "================================================="

# 1. SQL Schema (Tables & Views)
echo "1. Generating SQL: financial_reports.sql"
cat <<EOF > financial_reports.sql
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

EOF

# 2. Report Generator API
echo "2. Creating API: app/api/cron/report/route.ts"
mkdir -p app/api/cron/report
cat <<EOF > app/api/cron/report/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendAdminAlert } from '@/lib/admin-alert';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
         return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = createClient();
    
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
    const REPORT_HTML = \`
    <h1>Financial Report: \${report.month_str}</h1>
    <table border="1" cellpadding="10" style="border-collapse: collapse;">
        <tr>
            <th>Total Revenue</th>
            <td style="color: green;">Rp \${report.total_revenue.toLocaleString()}</td>
        </tr>
        <tr>
            <th>Operational Expenses</th>
            <td style="color: red;">(Rp \${report.total_expenses.toLocaleString()})</td>
        </tr>
        <tr>
            <th>NET PROFIT</th>
            <td style="font-weight: bold; font-size: 1.2em;">Rp \${report.net_profit.toLocaleString()}</td>
        </tr>
    </table>
    <p>Generated automatically by System.</p>
    \`;

    // 3. Send Email (Mock)
    console.log('[REPORT GENERATED]', report);
    await sendAdminAlert(\`Monthly Financial Report - \${report.month_str}\`, \`Revenue: \${report.total_revenue} | Expenses: \${report.total_expenses} | Profit: \${report.net_profit}\`);

    return NextResponse.json({ success: true, report });
}
EOF

echo ""
echo "================================================="
echo "Financial Reporting Ready!"
echo "1. Run 'financial_reports.sql'"
echo "2. Setup Cron: GET /api/cron/report (Monthly)"
