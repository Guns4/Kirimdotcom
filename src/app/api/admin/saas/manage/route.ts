import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

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
        // Get all API keys with user info and usage stats
        const { data: keys, error } = await supabase
            .from('saas_api_keys')
            .select(`
        *,
        users(email, full_name)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ keys: keys || [] });
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
        const { user_id, plan, quota_limit, domain_whitelist } = body;

        if (!user_id) {
            return NextResponse.json({ error: 'user_id required' }, { status: 400 });
        }

        // Generate secure API key
        const apiKey = 'ck_' + randomBytes(32).toString('hex');

        // Calculate expiry (1 year for PRO, 30 days for FREE)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (plan === 'PRO' ? 365 : 30));

        const { data, error } = await supabase
            .from('saas_api_keys')
            .insert({
                key: apiKey,
                user_id,
                plan: plan || 'FREE',
                quota_limit: quota_limit || (plan === 'PRO' ? 10000 : 1000),
                domain_whitelist: domain_whitelist || [],
                expires_at: expiresAt.toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, key: data });
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
        const keyId = searchParams.get('id');

        if (!keyId) {
            return NextResponse.json({ error: 'Key ID required' }, { status: 400 });
        }

        // Revoke key (set inactive)
        const { error } = await supabase
            .from('saas_api_keys')
            .update({ is_active: false })
            .eq('id', keyId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
