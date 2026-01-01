import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    try {
        // Public endpoint - no auth required for mobile app startup
        const { data: config, error } = await supabase
            .from('mobile_app_config')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) throw error;

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
        const {
            min_version_code,
            latest_version_code,
            latest_version_name,
            force_update,
            maintenance_mode,
            playstore_url,
            appstore_url,
            update_message,
            features_json
        } = body;

        const updateData: any = {};
        if (min_version_code !== undefined) updateData.min_version_code = min_version_code;
        if (latest_version_code !== undefined) updateData.latest_version_code = latest_version_code;
        if (latest_version_name !== undefined) updateData.latest_version_name = latest_version_name;
        if (force_update !== undefined) updateData.force_update = force_update;
        if (maintenance_mode !== undefined) updateData.maintenance_mode = maintenance_mode;
        if (playstore_url !== undefined) updateData.playstore_url = playstore_url;
        if (appstore_url !== undefined) updateData.appstore_url = appstore_url;
        if (update_message !== undefined) updateData.update_message = update_message;
        if (features_json !== undefined) updateData.features_json = features_json;

        const { error } = await supabase
            .from('mobile_app_config')
            .update(updateData)
            .eq('id', 1);

        if (error) throw error;

        // Log admin action
        await supabase.rpc('log_admin_action', {
            p_admin_id: null,
            p_action: 'UPDATE_MOBILE_CONFIG',
            p_details: updateData,
            p_ip: req.headers.get('x-forwarded-for') || 'unknown'
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
