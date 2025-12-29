import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// API Route for Database Archiving Cron Job
// Schedule: Monthly (1st of month at 3 AM)
export async function GET(request: NextRequest) {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Use service role client for admin operations
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Call archiving function
        const { data, error } = await supabase.rpc('archive_old_orders');

        if (error) {
            console.error('Archiving error:', error);
            return NextResponse.json(
                {
                    success: false,
                    error: error.message
                },
                { status: 500 }
            );
        }

        const archivedCount = data || 0;

        // Optional: Send notification to admin
        console.log(`✅ Archived ${archivedCount} orders`);

        return NextResponse.json({
            success: true,
            archivedCount,
            message: `Successfully archived ${archivedCount} old orders`,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('Archive cron error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}
