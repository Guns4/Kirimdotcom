import crypto from 'crypto';

export function verifySignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    serverKey: string,
    signatureKey: string
): boolean {
    // Standard Midtrans Signature: SHA512(order_id+status_code+gross_amount+ServerKey)
    const payload = orderId + statusCode + grossAmount + serverKey;
    const hash = crypto.createHash('sha512').update(payload).digest('hex');

    return hash === signatureKey;
}

export async function sendWhatsappNotification(phone: string, message: string): Promise<void> {
    // Mock Notification - In production, call generic WA API provider
    console.log(`[WA] To ${phone}: ${message}`);
}
