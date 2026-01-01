import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    try {
        // Public endpoint - anyone can read settings
        const { data, error } = await supabase
            .from('system_config')
            .select('*');

        if (error) throw error;

        // Convert array to object for easier consumption
        // { ADSENSE_RATIO: '70', ADSENSE_PUB_ID: 'ca-pub-xxx', ... }
        const config = data?.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        return NextResponse.json(config || {});
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
        // Body format: { ADSENSE_RATIO: '80', ADSENSE_PUB_ID: 'ca-pub-xxx', ... }

        const updates = Object.entries(body).map(([key, value]) => {
            return supabase
                .from('system_config')
                .upsert({
                    key,
                    value: String(value),
                    updated_at: new Date().toISOString()
                });
        });

        await Promise.all(updates);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
