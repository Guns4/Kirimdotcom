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
        // Get all ads with zone info
        const { data: ads, error: adsError } = await supabase
            .from('ad_campaigns')
            .select('*, ad_zones(name, required_width, required_height)')
            .order('created_at', { ascending: false });

        if (adsError) throw adsError;

        // Get all zones
        const { data: zones, error: zonesError } = await supabase
            .from('ad_zones')
            .select('*')
            .order('name');

        if (zonesError) throw zonesError;

        return NextResponse.json({ ads: ads || [], zones: zones || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { zone_code, name, image_url, target_url, end_date } = body;

        if (!zone_code || !name || !image_url || !target_url || !end_date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { error } = await supabase
            .from('ad_campaigns')
            .insert({
                zone_code,
                name,
                image_url,
                target_url,
                end_date,
                start_date: new Date().toISOString().split('T')[0]
            });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
