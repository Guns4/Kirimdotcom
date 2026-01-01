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
        const { data: devices, error } = await supabase
            .from('iot_devices')
            .select(`
        *,
        agents(agent_code, business_name)
      `)
            .order('last_heartbeat', { ascending: false, nullsFirst: false });

        if (error) throw error;

        // Auto-update status based on last_heartbeat
        const now = new Date();
        const devicesWithStatus = (devices || []).map((device: any) => {
            if (!device.last_heartbeat) {
                device.actual_status = 'OFFLINE';
            } else {
                const lastBeat = new Date(device.last_heartbeat);
                const minutesAgo = (now.getTime() - lastBeat.getTime()) / 1000 / 60;

                if (minutesAgo > 5) {
                    device.actual_status = 'OFFLINE';
                } else {
                    device.actual_status = device.status;
                }
            }
            return device;
        });

        return NextResponse.json({ devices: devicesWithStatus });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        // Public endpoint for device heartbeat (can be called by devices)
        const body = await req.json();
        const { device_id, status, battery_level, error_message, metadata } = body;

        if (!device_id) {
            return NextResponse.json({ error: 'device_id required' }, { status: 400 });
        }

        const updateData: any = {
            last_heartbeat: new Date().toISOString()
        };

        if (status) updateData.status = status;
        if (battery_level !== undefined) updateData.battery_level = battery_level;
        if (error_message !== undefined) updateData.error_message = error_message;
        if (metadata) updateData.metadata = metadata;

        const { error } = await supabase
            .from('iot_devices')
            .update(updateData)
            .eq('device_id', device_id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Heartbeat received' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
