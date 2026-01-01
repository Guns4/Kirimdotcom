import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// Gateway Helper Functions with Daily Limits
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

    // 1. CHECK MONTHLY QUOTA
    if (keyData.quota_limit && keyData.request_count >= keyData.quota_limit) {
        return {
            valid: false,
            response: NextResponse.json(
                { error: 'Monthly quota exceeded. Please upgrade your plan.' },
                { status: 429 }
            ),
        };
    }

    // 2. CHECK DAILY LIMIT (NUCLEAR SHIELD - FINAL SAFETY NET)
    // Get today's usage count
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: todayCount } = await supabase
        .from('saas_usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', keyData.user_id)
        .gte('created_at', today.toISOString());

    // Daily limits based on plan
    const dailyLimits: Record<string, number> = {
        'FREE': 10,           // Free tier: 10 requests/day (STRICT)
        'Developer': 10,      // Same as free
        'STARTUP': 1000,      // Startup: 1000 requests/day
        'Startup': 1000,
        'BUSINESS': 5000,     // Business: 5000 requests/day
        'Business': 5000,
        'ENTERPRISE': 999999, // Enterprise: Unlimited
        'Enterprise': 999999,
    };

    const dailyLimit = dailyLimits[keyData.key_name] || dailyLimits['FREE'];
    const usedToday = todayCount || 0;

    if (usedToday >= dailyLimit) {
        console.warn(`[DAILY LIMIT] User ${keyData.user_id} exceeded daily limit (${usedToday}/${dailyLimit})`);
        return {
            valid: false,
            response: NextResponse.json(
                {
                    error: 'Daily limit exceeded',
                    message: `Free tier is limited to ${dailyLimit} requests per day to prevent abuse. Upgrade for higher limits.`,
                    used_today: usedToday,
                    daily_limit: dailyLimit,
                    reset_time: 'Midnight (00:00 WIB)',
                },
                { status: 429 }
            ),
        };
    }

    return {
        valid: true,
        keyData,
        plan: keyData.key_name || 'Free',
        usedToday,
        dailyLimit,
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

        // Increment request count (monthly counter)
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
