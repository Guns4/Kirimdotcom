// WA Broadcast Service
// Safe bulk messaging with queue and quota system

import { WASocket } from '@whiskeysockets/baileys';

export interface BroadcastContact {
    name: string;
    phoneNumber: string;
    variables?: Record<string, string>;
}

export interface BroadcastMessage {
    id: string;
    userId: string;
    sessionId: string;
    content: string;
    contacts: BroadcastContact[];
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'PAUSED' | 'FAILED';
    sentCount: number;
    failedCount: number;
    totalCount: number;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
}

export interface BroadcastResult {
    phoneNumber: string;
    status: 'SENT' | 'FAILED' | 'INVALID';
    messageId?: string;
    error?: string;
    timestamp: Date;
}

export interface QuotaInfo {
    available: number;
    used: number;
    total: number;
}

// Quota pricing
export const QUOTA_PRICING = {
    PRICE_PER_1000: 20000, // Rp 20.000 per 1000 messages
    PACKAGES: [
        { messages: 500, price: 15000, label: '500 Pesan' },
        { messages: 1000, price: 20000, label: '1.000 Pesan' },
        { messages: 5000, price: 80000, label: '5.000 Pesan' },
        { messages: 10000, price: 150000, label: '10.000 Pesan' },
    ]
};

// Parse Excel/CSV contacts
export function parseContactsFromCSV(csvContent: string): BroadcastContact[] {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

    const nameIdx = headers.findIndex(h => h.includes('nama') || h.includes('name'));
    const phoneIdx = headers.findIndex(h => h.includes('hp') || h.includes('phone') || h.includes('telepon'));

    if (nameIdx === -1 || phoneIdx === -1) {
        throw new Error('CSV harus memiliki kolom Nama dan No HP');
    }

    return lines.slice(1).map(line => {
        const cols = line.split(',').map(c => c.trim().replace(/"/g, ''));
        return {
            name: cols[nameIdx] || 'Pelanggan',
            phoneNumber: normalizePhoneNumber(cols[phoneIdx] || '')
        };
    }).filter(c => c.phoneNumber);
}

// Normalize phone number to Indonesian format
export function normalizePhoneNumber(phone: string): string {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '');

    // Handle various formats
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
    } else if (cleaned.startsWith('8')) {
        cleaned = '62' + cleaned;
    } else if (!cleaned.startsWith('62')) {
        cleaned = '62' + cleaned;
    }

    // Validate length
    if (cleaned.length < 10 || cleaned.length > 15) {
        return '';
    }

    return cleaned;
}

// Generate random delay between min and max seconds
function randomDelay(minSeconds: number, maxSeconds: number): number {
    return (Math.random() * (maxSeconds - minSeconds) + minSeconds) * 1000;
}

// Sleep function
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Replace variables in message template
export function personalizeMessage(template: string, contact: BroadcastContact): string {
    let message = template.replace(/\{nama\}/gi, contact.name);

    if (contact.variables) {
        Object.entries(contact.variables).forEach(([key, value]) => {
            message = message.replace(new RegExp(`\\{${key}\\}`, 'gi'), value);
        });
    }

    return message;
}

// Broadcast queue processor
export async function processBroadcastQueue(
    socket: WASocket,
    broadcast: BroadcastMessage,
    onProgress: (sent: number, failed: number, total: number) => void,
    onComplete: (results: BroadcastResult[]) => void,
    checkQuota: () => Promise<number>,
    deductQuota: (amount: number) => Promise<void>
): Promise<void> {
    const results: BroadcastResult[] = [];
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < broadcast.contacts.length; i++) {
        const contact = broadcast.contacts[i];

        // Check remaining quota
        const remainingQuota = await checkQuota();
        if (remainingQuota <= 0) {
            console.log('Quota exhausted, stopping broadcast');
            break;
        }

        try {
            // Personalize message
            const personalizedMessage = personalizeMessage(broadcast.content, contact);

            // Format JID
            const jid = `${contact.phoneNumber}@s.whatsapp.net`;

            // Send message
            const result = await socket.sendMessage(jid, { text: personalizedMessage });

            results.push({
                phoneNumber: contact.phoneNumber,
                status: 'SENT',
                messageId: result?.key?.id,
                timestamp: new Date()
            });

            sentCount++;

            // Deduct quota
            await deductQuota(1);

        } catch (error: any) {
            results.push({
                phoneNumber: contact.phoneNumber,
                status: 'FAILED',
                error: error.message,
                timestamp: new Date()
            });
            failedCount++;
        }

        // Report progress
        onProgress(sentCount, failedCount, broadcast.contacts.length);

        // Random delay between messages (3-10 seconds) to avoid ban
        if (i < broadcast.contacts.length - 1) {
            const delay = randomDelay(3, 10);
            console.log(`Waiting ${Math.round(delay / 1000)}s before next message...`);
            await sleep(delay);
        }
    }

    onComplete(results);
}

// Validate contacts before broadcast
export function validateContacts(contacts: BroadcastContact[]): {
    valid: BroadcastContact[];
    invalid: string[];
} {
    const valid: BroadcastContact[] = [];
    const invalid: string[] = [];

    contacts.forEach(contact => {
        if (contact.phoneNumber && contact.phoneNumber.length >= 10) {
            valid.push(contact);
        } else {
            invalid.push(contact.name || 'Unknown');
        }
    });

    return { valid, invalid };
}

// Estimate broadcast time
export function estimateBroadcastTime(contactCount: number): string {
    // Average 6.5 seconds per message (3-10 random)
    const avgSeconds = 6.5;
    const totalSeconds = contactCount * avgSeconds;

    if (totalSeconds < 60) {
        return `${Math.round(totalSeconds)} detik`;
    } else if (totalSeconds < 3600) {
        return `${Math.round(totalSeconds / 60)} menit`;
    } else {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.round((totalSeconds % 3600) / 60);
        return `${hours} jam ${minutes} menit`;
    }
}

// Calculate cost
export function calculateCost(messageCount: number): number {
    return Math.ceil(messageCount / 1000) * QUOTA_PRICING.PRICE_PER_1000;
}
