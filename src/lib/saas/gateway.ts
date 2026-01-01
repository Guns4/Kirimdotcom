import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// Gateway Helper Functions
// ==========================================

export async function validateApiKey(req: Request) {
    const apiKey = req.headers.get('x-api-key');

    if (!apiKey) {
        return {
            valid: false,
            response: NextResponse.json(
                { error: 'Missing API key. Include x-api-key header.' },
                { status: 401 }
            ),
        };
    }

    // Validate against database
    const { data: keyData, error } = await supabase
        .from('saas_api_keys')
        .select('*, users(id, email)')
        .eq('api_key', apiKey)
        .eq('is_active', true)
        .single();

    if (error || !keyData) {
        return {
            valid: false,
            response: NextResponse.json(
                { error: 'Invalid API key' },
                { status: 403 }
            ),
        };
    }

    // Check quota
    if (keyData.quota_limit && keyData.request_count >= keyData.quota_limit) {
        return {
            valid: false,
            response: NextResponse.json(
                { error: 'API quota exceeded. Please upgrade your plan.' },
                { status: 429 }
            ),
        };
    }

    return {
        valid: true,
        keyData,
        plan: keyData.key_name || 'Startup',
    };
}

export async function logUsage(apiKey: string, endpoint: string, statusCode: number, responseTime?: number) {
    try {
        // Get key data
        const { data: keyData } = await supabase
            .from('saas_api_keys')
            .select('id, user_id')
            .eq('api_key', apiKey)
            .single();

        if (!keyData) return;

        // Log usage
        await supabase.from('saas_usage_logs').insert({
            user_id: keyData.user_id,
            api_key_id: keyData.id,
            endpoint,
            method: 'POST',
            status_code: statusCode,
            response_time: responseTime || 150,
        });

        // Increment request count
        await supabase
            .from('saas_api_keys')
            .update({ request_count: supabase.raw('request_count + 1') })
            .eq('id', keyData.id);
    } catch (error) {
        console.error('[Gateway] Log usage error:', error);
    }
}

export async function checkQuotaThreshold(apiKey: string): Promise<string | null> {
    try {
        const { data: keyData } = await supabase
            .from('saas_api_keys')
            .select('request_count, quota_limit, user_id')
            .eq('api_key', apiKey)
            .single();

        if (!keyData || !keyData.quota_limit) return null;

        const usagePercent = (keyData.request_count / keyData.quota_limit) * 100;

        if (usagePercent >= 80 && usagePercent < 90) {
            console.log(`[ALERT] User ${keyData.user_id} quota at ${usagePercent.toFixed(1)}%`);
            return `Warning: Your quota is ${usagePercent.toFixed(0)}% full. Upgrade soon to avoid interruption.`;
        } else if (usagePercent >= 90 && usagePercent < 95) {
            return `Critical: Your quota is ${usagePercent.toFixed(0)}% full. Upgrade immediately!`;
        }

        return null;
    } catch (error) {
        return null;
    }
}
