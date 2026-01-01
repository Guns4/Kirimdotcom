import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get active fleet (updated within last 1 minute)
        const { data, error } = await supabase.rpc('get_active_fleet');

        if (error) throw error;

        return NextResponse.json({ drivers: data || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        // Public endpoint for driver location update
        const body = await req.json();
        const { driver_code, lat, long, status, speed_kmh, battery_level } = body;

        if (!driver_code || lat === undefined || long === undefined) {
            return NextResponse.json({
                error: 'driver_code, lat, and long required'
            }, { status: 400 });
        }

        const updateData: any = {
            current_lat: lat,
            current_long: long,
            last_update: new Date().toISOString()
        };

        if (status) updateData.status = status;
        if (speed_kmh !== undefined) updateData.speed_kmh = speed_kmh;
        if (battery_level !== undefined) updateData.battery_level = battery_level;

        const { error } = await supabase
            .from('fleet_drivers')
            .update(updateData)
            .eq('driver_code', driver_code);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Location updated' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
