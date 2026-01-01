import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// POST /api/console/generate-key
// Generate new API key for user
// ==========================================

export async function POST(req: Request) {
    try {
        const { user_id } = await req.json();

        if (!user_id) {
            return NextResponse.json({ error: 'user_id required' }, { status: 400 });
        }

        // Check existing keys count
        const { count } = await supabase
            .from('saas_api_keys')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user_id)
            .eq('is_active', true);

        if (count && count >= 3) {
            return NextResponse.json(
                { error: 'Maximum 3 active API keys allowed' },
                { status: 400 }
            );
        }

        // Generate secure API key
        const apiKey = `ck_${crypto.randomBytes(32).toString('hex')}`;

        // Create API key
        const { data, error } = await supabase
            .from('saas_api_keys')
            .insert({
                user_id,
                api_key: apiKey,
                key_name: `API Key ${(count || 0) + 1}`,
                is_active: true,
                quota_limit: 10000, // Default quota
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        console.log('[Console] API key generated for user:', user_id);

        return NextResponse.json({
            success: true,
            api_key: data,
        });
    } catch (error: any) {
        console.error('[Console] Generate key error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate API key',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
