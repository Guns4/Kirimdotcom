// ============================================
// AI ADVICE GENERATION API ROUTE
// ============================================
// Uses DeepSeek API for cost-effective AI responses

import { NextRequest, NextResponse } from 'next/server'

// DeepSeek API Configuration
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const API_KEY = process.env.DEEPSEEK_API_KEY

// Rate limiting (simple in-memory store)
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10

interface AdviceRequest {
    type: 'insight' | 'complaint'
    trackingData: {
        resiNumber: string
        courier: string
        currentStatus: string
        statusDate: string
        history: Array<{
            date: string
            desc: string
            location: string
        }>
    }
}

// Helper: Check rate limit
function checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const requests = rateLimitMap.get(ip) || []

    // Remove old requests outside window
    const validRequests = requests.filter((time) => now - time < RATE_LIMIT_WINDOW)

    if (validRequests.length >= MAX_REQUESTS_PER_WINDOW) {
        return false
    }

    validRequests.push(now)
    rateLimitMap.set(ip, validRequests)
    return true
}

// Helper: Detect stuck package
function isPackageStuck(history: Array<{ date: string }>): { stuck: boolean; daysSinceUpdate: number } {
    if (!history || history.length === 0) {
        return { stuck: false, daysSinceUpdate: 0 }
    }

    const lastUpdate = new Date(history[0].date)
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)

    return {
        stuck: daysSinceUpdate > 3,
        daysSinceUpdate: Math.floor(daysSinceUpdate)
    }
}

// Helper: Generate AI advice using DeepSeek
async function generateAIAdvice(request: AdviceRequest): Promise<string> {
    if (!API_KEY) {
        throw new Error('DEEPSEEK_API_KEY not configured')
    }

    const { type, trackingData } = request
    const stuckInfo = isPackageStuck(trackingData.history)

    // Build prompt based on type
    let systemPrompt = ''
    let userPrompt = ''

    if (type === 'insight') {
        systemPrompt = `Kamu adalah asisten logistik yang ahli dan ramah. Tugasmu adalah menganalisis status pengiriman paket dan memberikan saran yang membantu kepada pengguna.

Prinsip:
- Gunakan bahasa Indonesia yang sopan dan profesional
- Berikan saran praktis dan actionable
- Jika paket terlambat, beri solusi tanpa membuat panik
- Jika paket normal, beri reassurance
- Maksimal 2-3 kalimat`

        userPrompt = `Analisis status pengiriman ini:

Kurir: ${trackingData.courier}
Nomor Resi: ${trackingData.resiNumber}
Status: ${trackingData.currentStatus}
Terakhir update: ${trackingData.statusDate}
Hari sejak update terakhir: ${stuckInfo.daysSinceUpdate}
Lokasi terakhir: ${trackingData.history[0]?.location || 'Tidak diketahui'}

${stuckInfo.stuck ? `⚠️ Paket tampaknya stuck (tidak bergerak ${stuckInfo.daysSinceUpdate} hari).` : '✅ Paket bergerak normal.'}

Berikan insight dan saran untuk pengguna.`

    } else if (type === 'complaint') {
        systemPrompt = `Kamu adalah asisten yang membantu membuat teks komplain profesional untuk customer service ekspedisi.

Prinsip:
- Bahasa Indonesia formal tapi tetap sopan
- To the point, sebutkan fakta
- Tegas tapi tidak emosional
- Minta tindakan spesifik
- Akhiri dengan terima kasih`

        userPrompt = `Buatkan teks komplain untuk customer service ${trackingData.courier}:

Nomor Resi: ${trackingData.resiNumber}
Masalah: Paket stuck di ${trackingData.history[0]?.location} sejak ${trackingData.statusDate} (${stuckInfo.daysSinceUpdate} hari)

Format:
Kepada Yth. Customer Service ${trackingData.courier},

[isi komplain profesional]

Hormat saya,
[Pengguna]`
    }

    // Call DeepSeek API
    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                temperature: 0.7,
                max_tokens: 300,
            }),
        })

        if (!response.ok) {
            throw new Error(`DeepSeek API error: ${response.status}`)
        }

        const data = await response.json()
        return data.choices[0]?.message?.content || 'Maaf, tidak dapat menghasilkan saran saat ini.'

    } catch (error) {
        console.error('DeepSeek API error:', error)

        // Fallback responses
        if (type === 'insight') {
            if (stuckInfo.stuck) {
                return `Paket Anda sudah ${stuckInfo.daysSinceUpdate} hari di lokasi yang sama. Sebaiknya hubungi customer service ${trackingData.courier} untuk pengecekan lebih lanjut. Biasanya mereka bisa memberikan update terbaru tentang status pengiriman.`
            }
            return `Pengiriman berjalan normal. Paket Anda sedang dalam proses dan akan segera sampai. Cek kembali dalam beberapa jam untuk update terbaru.`
        } else {
            return `Kepada Yth. Customer Service ${trackingData.courier},

Saya ingin menanyakan status paket dengan nomor resi ${trackingData.resiNumber}. Paket terakhir berada di ${trackingData.history[0]?.location} sejak ${trackingData.statusDate}. Mohon bantuannya untuk pengecekan dan update status terbaru.

Terima kasih atas perhatiannya.`
        }
    }
}

// POST handler
export async function POST(request: NextRequest) {
    try {
        // Get IP for rate limiting
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown'

        // Check rate limit
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Terlalu banyak permintaan. Coba lagi dalam 1 menit.' },
                { status: 429 }
            )
        }

        // Parse request body
        const body: AdviceRequest = await request.json()

        // Validate input
        if (!body.type || !body.trackingData) {
            return NextResponse.json(
                { error: 'Invalid request format' },
                { status: 400 }
            )
        }

        if (!['insight', 'complaint'].includes(body.type)) {
            return NextResponse.json(
                { error: 'Invalid type. Use "insight" or "complaint"' },
                { status: 400 }
            )
        }

        // Generate AI advice
        const advice = await generateAIAdvice(body)

        // Return response
        return NextResponse.json({
            success: true,
            advice,
            type: body.type,
            generatedAt: new Date().toISOString(),
        })

    } catch (error) {
        console.error('AI advice generation error:', error)

        return NextResponse.json(
            {
                error: 'Gagal menghasilkan saran. Silakan coba lagi.',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
