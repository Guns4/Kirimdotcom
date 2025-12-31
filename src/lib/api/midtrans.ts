import midtransClient from 'midtrans-client';

// ==========================================
// Midtrans Configuration
// ==========================================

const IS_PRODUCTION = process.env.NODE_ENV === 'production' && process.env.MIDTRANS_IS_PRODUCTION === 'true';

// Snap API - For creating payment pages
export const snap = new midtransClient.Snap({
    isProduction: IS_PRODUCTION,
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
});

// Core API - For direct transactions and status check
export const coreApi = new midtransClient.CoreApi({
    isProduction: IS_PRODUCTION,
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
});

// ==========================================
// Helper Functions
// ==========================================

/**
 * Create Snap token for payment
 */
export async function createSnapToken(params: {
    orderId: string;
    amount: number;
    customerDetails?: {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
    };
}) {
    try {
        const parameter = {
            transaction_details: {
                order_id: params.orderId,
                gross_amount: params.amount,
            },
            customer_details: params.customerDetails || {
                first_name: 'Customer',
                last_name: params.orderId,
            },
            callbacks: {
                finish: `${process.env.NEXT_PUBLIC_BASE_URL}/wallet?status=success`,
                error: `${process.env.NEXT_PUBLIC_BASE_URL}/wallet?status=error`,
                pending: `${process.env.NEXT_PUBLIC_BASE_URL}/wallet?status=pending`,
            },
            credit_card: {
                secure: true,
            },
        };

        const transaction = await snap.createTransaction(parameter);
        return {
            success: true,
            token: transaction.token,
            redirect_url: transaction.redirect_url,
        };
    } catch (error: any) {
        console.error('[Midtrans] Create token error:', error);
        return {
            success: false,
            error: error.message || 'Failed to create payment token',
        };
    }
}

/**
 * Check transaction status
 */
export async function checkTransactionStatus(orderId: string) {
    try {
        const status = await coreApi.transaction.status(orderId);
        return {
            success: true,
            data: status,
        };
    } catch (error: any) {
        console.error('[Midtrans] Status check error:', error);
        return {
            success: false,
            error: error.message || 'Failed to check transaction status',
        };
    }
}

/**
 * Verify notification signature from Midtrans webhook
 */
export function verifySignature(notification: {
    order_id: string;
    status_code: string;
    gross_amount: string;
    signature_key: string;
}): boolean {
    const crypto = require('crypto');
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';

    const input = notification.order_id + notification.status_code + notification.gross_amount + serverKey;
    const hash = crypto.createHash('sha512').update(input).digest('hex');

    return hash === notification.signature_key;
}

export default {
    snap,
    coreApi,
    createSnapToken,
    checkTransactionStatus,
    verifySignature,
};
