import { NextResponse } from 'next/server';
import { validateApiKey, logUsage, checkQuotaThreshold } from '@/lib/saas/gateway';
import { CostRequestSchema } from '@/lib/saas/schemas/logistics';
import { z } from 'zod';

// Simulasi Logic Core
const MOCK_RESULTS = [
    { code: "JNE", service: "REG", cost: 10000, etd: "1-2 Days" },
    { code: "SICEPAT", service: "GOKIL", cost: 9000, etd: "2-3 Days" }
];

export async function POST(req: Request) {
    const startTime = Date.now();

    // 1. SECURITY: CORS Headers
    const headers = {
        'Access-Control-Allow-Origin': '*', // In production, specify allowed domains
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    };

    // Handle Preflight Request
    if (req.method === 'OPTIONS') {
        return NextResponse.json({}, { headers });
    }

    // 2. AUTH: Validate API Key & Quota
    const validation = await validateApiKey(req);
    if (!validation.valid) {
        return validation.response;
    }

    const apiKey = req.headers.get('x-api-key') || '';

    try {
        const body = await req.json();

        // 3. VALIDATION: Zod Schema Check (Prevent Garbage)
        const validatedData = CostRequestSchema.parse(body);

        // 4. LOGIC: Call Core Service (Mock for now)
        // In production: const results = await calculateShipping(validatedData);
        const results = MOCK_RESULTS;

        // 5. ALERTING: Check Quota Threshold
        const warning = await checkQuotaThreshold(apiKey);

        // 6. LOGGING & RESPONSE
        const responseTime = Date.now() - startTime;
        await logUsage(apiKey, '/v1/cost', 200, responseTime);

        return NextResponse.json(
            {
                status: 'success',
                meta: {
                    plan: validation.plan,
                    quota_warning: warning,
                    response_time_ms: responseTime,
                },
                data: results,
            },
            { headers }
        );
    } catch (error) {
        // Handle Zod Validation Errors
        if (error instanceof z.ZodError) {
            await logUsage(apiKey, '/v1/cost', 400);
            return NextResponse.json(
                {
                    error: 'Validation Error',
                    details: error.errors.map((e) => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                },
                { status: 400, headers }
            );
        }

        // Generic Server Error
        await logUsage(apiKey, '/v1/cost', 500);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500, headers }
        );
    }
}
