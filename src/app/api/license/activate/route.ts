import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const { license_key, domain } = await request.json();
        const supabase = createClient();

        // 1. Find License
        const { data: license, error } = await supabase
            .from('plugin_licenses')
            .select('*')
            .eq('license_key', license_key)
            .single();

        if (error || !license) {
            return NextResponse.json({ valid: false, message: 'Invalid Key' }, { status: 400 });
        }

        // 2. Check Status & Expiry
        if (license.status !== 'ACTIVE') {
            return NextResponse.json({ valid: false, message: 'License Suspended/Expired' }, { status: 403 });
        }

        if (new Date(license.expires_at) < new Date()) {
            return NextResponse.json({ valid: false, message: 'License Expired' }, { status: 403 });
        }

        // 3. Domain Check (Bind on First Use)
        if (!license.domain) {
            // Bind now
            await supabase.from('plugin_licenses').update({ domain }).eq('id', license.id);
        } else if (license.domain !== domain) {
            return NextResponse.json({ valid: false, message: 'License domain mismatch' }, { status: 403 });
        }

        return NextResponse.json({ valid: true, message: 'Activated', expires_at: license.expires_at });

    } catch (e) {
        return NextResponse.json({ valid: false, message: 'Server Error' }, { status: 500 });
    }
}
