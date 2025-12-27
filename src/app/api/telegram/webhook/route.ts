
import { Bot, webhookCallback } from 'grammy'
import { findCityByName } from '@/utils/telegram-search'
import { checkOngkir, trackResi } from '@/app/actions/logistics'
import { courierList } from '@/data/couriers'

// Initialize Bot
const token = process.env.TELEGRAM_BOT_TOKEN
if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is not defined')
} // We can't crash here because build might run without env vars

const bot = new Bot(token || 'dummy_token')

// Marketing Footer
const MARKETING_FOOTER = '\n\n📦 *CekKirim.com*\n_Cek Ongkir & Lacak Paket Mudah_'

// Command: /start
bot.command('start', (ctx) => {
    ctx.reply(
        '👋 Halo! Saya bot CekKirim.com.\n\n' +
        'Gunakan perintah berikut:\n' +
        '1️⃣ `/cek [resi]` - Lacak paket\n' +
        '2️⃣ `/ongkir [asal] [tujuan] [berat_kg]` - Cek tarif\n\n' +
        'Contoh:\n' +
        '`/cek JP123456789`\n' +
        '`/ongkir Jakarta Bandung 1`' +
        MARKETING_FOOTER,
        { parse_mode: 'Markdown' }
    )
})

// Command: /cek [resi]
bot.command('cek', async (ctx) => {
    const args = ctx.match?.toString().split(' ') || []
    const resi = args[0]

    if (!resi) {
        return ctx.reply('⚠️ Mohon sertakan nomor resi.\nContoh: `/cek JP123456789`', { parse_mode: 'Markdown' })
    }

    await ctx.reply('🔍 Sedang melacak paket...')

    // Try to auto-detect courier using our list or try common ones
    // Since trackResi API usually requires courierCode, simple "all courier" check might be heavy.
    // For this bot, let's try a heuristic or loop through common ones if not provided?
    // User request just said "/cek [resi]".
    // We can try to implement a multi-courier check or just asking user to provide courier. 
    // Implementation Plan didn't specify auto-detect logic. 
    // Let's assume we try a few common ones OR we just ask user? 
    // Wait, the web app has "Voice Receipt Check" that auto detects. 
    // "Smart Parsing Logic (Courier + Resi)".
    // Let's use a simpler approach: Try to detect from known patterns if possible, 
    // OR just loop top 3 (JNE, JNT, Sicepat) if specific pattern not found.
    // BETTER: Allow `/cek [kurir] [resi]` OR try to find courier in the text.
    // But user spec: "/cek [resi]".
    // BinderByte usually needs courier.
    // Let's try to loop common couriers: jne, jnt, sicepat, anteraja.

    // Fallback: Check if user provided courier in args?
    // Let's loop limited set for UX.

    const couriersToCheck = ['jne', 'jnt', 'sicepat', 'anteraja', 'shopee', 'spx']
    let found = false

    for (const courier of couriersToCheck) {
        const result = await trackResi({ resiNumber: resi, courierCode: courier })
        if (result.success && result.data) {
            const history = result.data.history[0] // Latest
            const message =
                `📦 *Status Paket ${result.data.courier}*\n` +
                `Resi: \`${result.data.resiNumber}\`\n\n` +
                `📍 *${result.data.currentStatus}*\n` +
                `${history ? `_${history.date}_\n${history.desc}` : ''}` +
                `\n\n🔗 [Lihat Detail Lengkap](${result.officialUrl || 'https://cekkirim.com'})` +
                MARKETING_FOOTER

            await ctx.reply(message, { parse_mode: 'Markdown' })
            found = true
            break
        }
    }

    if (!found) {
        await ctx.reply(
            '❌ Paket tidak ditemukan di kurir populer (JNE, J&T, SiCepat, AnterAja, SPX).\n' +
            'Coba format: `/cek [kurir] [resi]` jika kurir lain.',
            { parse_mode: 'Markdown' }
        )
    }
})

// Command: /ongkir [asal] [tujuan] [berat]
bot.command('ongkir', async (ctx) => {
    // Expected format: /ongkir Jakarta Bandung 1
    const match = ctx.match?.toString()
    if (!match) {
        return ctx.reply('⚠️ Format salah.\nGunakan: `/ongkir [asal] [tujuan] [berat_kg]`\nContoh: `/ongkir Jakarta Bandung 1`', { parse_mode: 'Markdown' })
    }

    const args = match.split(' ')
    // We expect at least 3 args. 
    // Use regex or logic to pop weight from end.

    // Heuristic: Last arg is weight?
    const weightArg = args[args.length - 1]
    const weightKg = parseFloat(weightArg) || 1

    // Remaining is cities. 
    // "Jakarta Selatan Bandung" -> 3 parts. 
    // Complex to split "Jakarta Selatan" vs "Bandung".
    // Simple heuristic: User typically types "Jakarta Bandung 1".
    // If we can't easily split, assume 1 word city? No, many cities are 2 words.
    // Better UX: Split by comma? User didn't specify comma.
    // Let's try: split matching.

    // Attempt: Remove weight from string.
    const cityString = match.replace(weightArg, '').trim()

    // Try to find split point.
    // Bruteforce split index?
    // "Jakarta Bandung" -> "Jakarta", "Bandung"
    // "Jakarta Selatan Bandung" -> "Jakarta Selatan", "Bandung"
    // "Bandung Jakarta Selatan" -> "Bandung", "Jakarta Selatan"

    // We can iterate words and try to find valid city for left and right parts.
    const words = cityString.split(' ')
    let origin: any = null
    let dest: any = null

    for (let i = 1; i < words.length; i++) {
        const left = words.slice(0, i).join(' ')
        const right = words.slice(i).join(' ')

        const foundLeft = findCityByName(left)
        const foundRight = findCityByName(right)

        if (foundLeft && foundRight) {
            origin = foundLeft
            dest = foundRight
            break
        }
    }

    if (!origin || !dest) {
        return ctx.reply(
            '⚠️ Kota tidak ditemukan atau format ambigu.\n' +
            'Pastikan nama kota benar.\n' +
            'Tips: Gunakan nama kota utama.' + MARKETS_FOOTER,
            { parse_mode: 'Markdown' }
        )
    }

    await ctx.reply(`🔍 Cek ongkir: ${origin.name} -> ${dest.name} (${weightKg}kg)...`)

    const result = await checkOngkir({
        originId: origin.id,
        destinationId: dest.id,
        weight: weightKg * 1000 // convert to grams
    })

    if (!result.success || !result.data) {
        return ctx.reply('❌ Gagal mengambil data ongkir. Silakan coba lagi nanti.')
    }

    // Sort by price cheapest
    const rates = result.data.sort((a, b) => a.price - b.price).slice(0, 5) // Top 5

    let replyMsg = `💰 *Ongkir ${origin.name} - ${dest.name} (${weightKg}kg)*\n\n`

    rates.forEach(rate => {
        replyMsg += `*${rate.courier} ${rate.service}*\n`
        replyMsg += `Rp ${rate.price.toLocaleString('id-ID')} | ${rate.estimatedDays}\n\n`
    })

    replyMsg += `[Lihat ${result.data.length} opsi lainnya di CekKirim.com](https://cekkirim.com)` + MARKETING_FOOTER

    await ctx.reply(replyMsg, { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } })
})

// Webhook Handler
export const POST = webhookCallback(bot, 'std/http')
