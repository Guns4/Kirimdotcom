import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { waybill, courier } = await request.json();

        if (!waybill || !courier) {
            return NextResponse.json(
                { error: 'Missing waybill or courier' },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);

        // 1. Fetch Status from Provider (Binderbyte)

        // Mocking response
        const mockStatus = {
            status: 'ON_PROCESS',
            history: [
                { date: new Date().toISOString(), desc: 'Package picked up', location: 'Jakarta' },
                { date: new Date().toISOString(), desc: 'Manifested', location: 'Jakarta Hub' }
            ]
        };

        // 2. Save/Upsert to Tracking History
        const { error: upsertError } = await supabase
            .from('tracking_history')
            .upsert({
                waybill,
                courier,
                status: mockStatus.status,
                history: mockStatus.history,
                last_fetched_at: new Date().toISOString()
            }, {
                onConflict: 'waybill, courier'
            });

        if (upsertError) {
            console.error('Failed to update tracking history:', upsertError);
        }

        return NextResponse.json({
            data: mockStatus
        });

    } catch (error) {
        console.error('Tracking Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
