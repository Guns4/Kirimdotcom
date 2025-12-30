// WA Auto-Reply Bot Engine
// Smart resi detection and automated status replies

import { WASocket, proto } from '@whiskeysockets/baileys';

// Courier Resi Patterns
export const RESI_PATTERNS: { courier: string; pattern: RegExp; example: string }[] = [
    { courier: 'JNE', pattern: /\b(JP|JD|JW)\d{10,12}\b/i, example: 'JP1234567890' },
    { courier: 'J&T', pattern: /\b(JT|JD)?\d{12,15}\b/i, example: '000123456789012' },
    { courier: 'SiCepat', pattern: /\b(SC|000)\d{10,12}\b/i, example: 'SC1234567890' },
    { courier: 'Anteraja', pattern: /\b(10|20)\d{12,14}\b/i, example: '10001234567890' },
    { courier: 'Ninja', pattern: /\bNV(SG|ID|MY)\d{10,12}\b/i, example: 'NVID12345678' },
    { courier: 'Pos', pattern: /\b(CN|EMS|CP)\d{13}\b/i, example: 'CN1234567890123' },
    { courier: 'Wahana', pattern: /\bAGK\d{10}\b/i, example: 'AGK1234567890' },
    { courier: 'Lion', pattern: /\b(LEX|LP)\d{10,12}\b/i, example: 'LEX1234567890' },
];

export interface DetectedResi {
    resiNumber: string;
    courier: string;
    confidence: number;
}

export interface TrackingStatus {
    resiNumber: string;
    courier: string;
    status: string;
    lastUpdate: string;
    estimatedDelivery?: string;
    origin?: string;
    destination?: string;
}

export interface SubscriptionStatus {
    isActive: boolean;
    plan: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
    autoReplyEnabled: boolean;
    dailyQuota: number;
    usedToday: number;
}

// Detect resi numbers in message
export function detectResi(message: string): DetectedResi[] {
    const results: DetectedResi[] = [];

    for (const { courier, pattern } of RESI_PATTERNS) {
        const matches = message.match(pattern);
        if (matches) {
            matches.forEach(match => {
                results.push({
                    resiNumber: match.toUpperCase(),
                    courier,
                    confidence: 0.9
                });
            });
        }
    }

    return results;
}

// Mock tracking API (replace with actual CekKirim API)
export async function getTrackingStatus(resiNumber: string, courier: string): Promise<TrackingStatus> {
    // In production: Call actual tracking API
    // const response = await fetch(`/api/tracking/${resiNumber}?courier=${courier}`);

    // Mock response
    const statuses = [
        'Paket sedang diproses di gudang asal',
        'Paket dalam perjalanan ke kota tujuan',
        'Paket tiba di kota tujuan',
        'Paket sedang diantar kurir',
        'Paket telah diterima'
    ];

    return {
        resiNumber,
        courier,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        lastUpdate: new Date().toLocaleString('id-ID'),
        estimatedDelivery: 'Besok, 14:00 - 18:00',
        origin: 'Jakarta',
        destination: 'Surabaya'
    };
}

// Check seller subscription
export async function checkSubscription(sellerId: string): Promise<SubscriptionStatus> {
    // In production: Query database
    // const { data } = await supabase.from('subscriptions').select('*').eq('user_id', sellerId);

    // Mock response
    return {
        isActive: true,
        plan: 'PREMIUM',
        autoReplyEnabled: true,
        dailyQuota: 1000,
        usedToday: 150
    };
}

// Generate reply message
export function generateReplyMessage(tracking: TrackingStatus): string {
    return `Halo kak 👋

📦 *Informasi Paket Anda*
━━━━━━━━━━━━━━━━━
🔖 No. Resi: \`${tracking.resiNumber}\`
🚚 Kurir: ${tracking.courier}

📍 *Status:*
${tracking.status}

🕐 Update: ${tracking.lastUpdate}
📅 Estimasi: ${tracking.estimatedDelivery || 'Lihat detail tracking'}

━━━━━━━━━━━━━━━━━
Terima kasih telah berbelanja! 🙏
_Powered by CekKirim.com_`;
}

// Generate no-subscription message
export function generateNoSubscriptionMessage(): string {
    return `Mohon maaf, fitur auto-reply belum aktif untuk akun ini.

Upgrade ke *Bot Premium* untuk mengaktifkan fitur:
✅ Auto-reply status paket
✅ Notifikasi update pengiriman
✅ Broadcast promo

Info: wa.me/6281234567890?text=Upgrade%20Premium`;
}

// Generate quota exceeded message
export function generateQuotaExceededMessage(): string {
    return `Kuota auto-reply hari ini sudah habis 😔

Upgrade ke paket lebih tinggi untuk kuota lebih besar!`;
}

// Message handler for auto-reply
export async function handleIncomingMessage(
    socket: WASocket,
    message: proto.IWebMessageInfo,
    sellerId: string
): Promise<{ replied: boolean; reason?: string }> {
    // Get message text
    const text = message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        '';

    if (!text) {
        return { replied: false, reason: 'No text content' };
    }

    // Check subscription
    const subscription = await checkSubscription(sellerId);

    if (!subscription.isActive || !subscription.autoReplyEnabled) {
        return { replied: false, reason: 'Subscription not active' };
    }

    if (subscription.plan === 'FREE') {
        // Free plan doesn't have auto-reply
        return { replied: false, reason: 'Free plan' };
    }

    if (subscription.usedToday >= subscription.dailyQuota) {
        return { replied: false, reason: 'Quota exceeded' };
    }

    // Detect resi in message
    const detectedResis = detectResi(text);

    if (detectedResis.length === 0) {
        return { replied: false, reason: 'No resi detected' };
    }

    // Get tracking status for first detected resi
    const resi = detectedResis[0];
    const tracking = await getTrackingStatus(resi.resiNumber, resi.courier);

    // Generate reply
    const replyText = generateReplyMessage(tracking);

    // Send reply
    const jid = message.key.remoteJid!;
    await socket.sendMessage(jid, {
        text: replyText
    }, {
        quoted: message
    });

    // Log the auto-reply (in production: save to database)
    console.log(`Auto-replied to ${jid} for resi ${resi.resiNumber}`);

    return { replied: true };
}

// Setup message listener
export function setupAutoReplyListener(
    socket: WASocket,
    sellerId: string
): void {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
            // Skip if from self
            if (msg.key.fromMe) continue;

            // Skip if group message (optional: enable for groups)
            if (msg.key.remoteJid?.includes('@g.us')) continue;

            try {
                await handleIncomingMessage(socket, msg, sellerId);
            } catch (error) {
                console.error('Auto-reply error:', error);
            }
        }
    });
}
