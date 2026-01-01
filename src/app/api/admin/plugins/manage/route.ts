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
        const slug = searchParams.get('slug');

        let query = supabase
            .from('plugin_releases')
            .select('*')
            .order('created_at', { ascending: false });

        if (slug) {
            query = query.eq('plugin_slug', slug);
        }

        const { data: releases, error } = await query;

        if (error) throw error;

        return NextResponse.json({ releases: releases || [] });
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
            plugin_slug,
            version,
            file_url,
            changelog,
            is_public,
            is_stable,
            min_php_version,
            min_wp_version,
            tested_up_to
        } = body;

        if (!plugin_slug || !version || !file_url) {
            return NextResponse.json({
                error: 'plugin_slug, version, and file_url required'
            }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('plugin_releases')
            .insert({
                plugin_slug,
                version,
                file_url,
                changelog: changelog || '',
                is_public: is_public !== undefined ? is_public : true,
                is_stable: is_stable !== undefined ? is_stable : true,
                min_php_version: min_php_version || '7.4',
                min_wp_version: min_wp_version || '5.0',
                tested_up_to
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, release: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('plugin_releases')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
