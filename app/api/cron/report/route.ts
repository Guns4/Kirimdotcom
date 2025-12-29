import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendAdminAlert } from '@/lib/admin-alert';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
    const REPORT_HTML = `
    <h1>Financial Report: ${report.month_str}</h1>
    <table border="1" cellpadding="10" style="border-collapse: collapse;">
        <tr>
            <th>Total Revenue</th>
            <td style="color: green;">Rp ${report.total_revenue.toLocaleString()}</td>
        </tr>
        <tr>
            <th>Operational Expenses</th>
            <td style="color: red;">(Rp ${report.total_expenses.toLocaleString()})</td>
        </tr>
        <tr>
            <th>NET PROFIT</th>
            <td style="font-weight: bold; font-size: 1.2em;">Rp ${report.net_profit.toLocaleString()}</td>
        </tr>
    </table>
    <p>Generated automatically by System.</p>
    `;

    // 3. Send Email (Mock)
    console.log('[REPORT GENERATED]', report);
    await sendAdminAlert(`Monthly Financial Report - ${report.month_str}`, `Revenue: ${report.total_revenue} | Expenses: ${report.total_expenses} | Profit: ${report.net_profit}`);

    return NextResponse.json({ success: true, report });
}
