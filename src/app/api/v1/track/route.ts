import { NextRequest, NextResponse } from 'next/server'
import { trackResi } from '@/app/actions/logistics'

// Force dynamic since we use query params/body
export const dynamic = 'force-dynamic'

// POST /api/v1/track
// Body: { resi: string, courier: string }
export async function POST(req: NextRequest) {
    // CORS Headers
    const headers = {
        'Access-Control-Allow-Origin': '*', // Allow extension
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    if (req.method === 'OPTIONS') {
        return NextResponse.json({}, { headers })
    }

    try {
        const body = await req.json()
        const { resi, courier } = body

        if (!resi || !courier) {
            return NextResponse.json(
                { success: false, error: 'Resi dan Kurir wajib diisi' },
                { status: 400, headers }
            )
        }

        // Call existing server action logic
        const result = await trackResi({ resiNumber: resi, courierCode: courier })

        return NextResponse.json(result, { headers })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500, headers }
        )
    }
}
