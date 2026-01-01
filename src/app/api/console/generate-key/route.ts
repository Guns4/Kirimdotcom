import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// POST /api/console/generate-key
// Generate or regenerate API key
// ==========================================

export async function POST(req: Request) {
    try {
        // Get authorization header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify user session
        const token = authHeader.replace('Bearer ', '');
        const supabaseAuth = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const {
            data: { user },
        } = await supabaseAuth.auth.getUser(token);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user already has an active key
        const { data: existingKeys } = await supabase
            .from('saas_api_keys')
            .select('id')
            .eq('user_id', user.id)
            .eq('is_active', true);

        // Deactivate old keys
        if (existingKeys && existingKeys.length > 0) {
            await supabase
                .from('saas_api_keys')
                .update({ is_active: false })
                .eq('user_id', user.id);
        }

        // Generate new secure API key
        const apiKey = `ck_${crypto.randomBytes(32).toString('hex')}`;

        // Insert new key
        const { data, error } = await supabase
            .from('saas_api_keys')
            .insert({
                user_id: user.id,
                api_key: apiKey,
                key_name: 'Production Key',
                is_active: true,
                quota_limit: 10000, // Default 10K requests/month
                request_count: 0,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        console.log('[Console] New API key generated for user:', user.id);

        return NextResponse.json({
            success: true,
            api_key: data.api_key,
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
