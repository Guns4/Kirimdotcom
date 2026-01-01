import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const { ad_id } = await req.json();

        if (!ad_id) {
            return NextResponse.json({ error: 'ad_id required' }, { status: 400 });
        }

        // Increment click counter
        await supabase.rpc('increment_ad_click', { p_ad_id: ad_id });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Click tracking error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
