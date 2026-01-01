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
        const { searchParams } = new URL(req.url);
        const admin_id = searchParams.get('admin_id');

        if (!admin_id) {
            return NextResponse.json({ error: 'admin_id required' }, { status: 400 });
        }

        const { data: config } = await supabase
            .from('admin_ui_configs')
            .select('*')
            .eq('admin_id', admin_id)
            .single();

        return NextResponse.json({ config: config || {} });
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
        const { admin_id, layout_json, theme_mode, sidebar_collapsed, favorite_modules } = body;

        const updateData: any = { updated_at: new Date().toISOString() };

        if (layout_json) updateData.layout_json = layout_json;
        if (theme_mode) updateData.theme_mode = theme_mode;
        if (sidebar_collapsed !== undefined) updateData.sidebar_collapsed = sidebar_collapsed;
        if (favorite_modules) updateData.favorite_modules = favorite_modules;

        const { data, error } = await supabase
            .from('admin_ui_configs')
            .upsert({ admin_id, ...updateData })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, config: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
