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
