// ============================================
// MODULAR PAYMENT SERVICE
// ============================================
// Payment gateway agnostic - easy to swap providers

export type PaymentGateway = 'midtrans' | 'xendit' | 'lemonsqueezy' | 'manual'
export type PlanType = 'monthly' | 'yearly' | 'lifetime'

export interface PlanConfig {
    id: string
    name: string
    type: PlanType
    price: number // in IDR
    originalPrice?: number // for showing discount
    features: string[]
    popular?: boolean
    durationDays: number | null // null = lifetime
}

export interface PaymentRequest {
    planId: string
    userId: string
    email: string
    name?: string
}

export interface PaymentResult {
    success: boolean
    transactionId?: string
    redirectUrl?: string  // For redirect-based payment
    snapToken?: string    // For Midtrans Snap
    invoiceUrl?: string   // For Xendit invoice
    error?: string
}

// ============================================
// PRICING PLANS CONFIGURATION
// ============================================

export const pricingPlans: PlanConfig[] = [
    {
        id: 'free',
        name: 'Gratis',
        type: 'monthly',
        price: 0,
        features: [
            'Cek resi semua kurir',
            'Cek ongkir dasar',
            'Maksimal 10 tracking/hari',
            'Dengan iklan',
        ],
        durationDays: null,
    },
    {
        id: 'pro-monthly',
        name: 'Pro Bulanan',
        type: 'monthly',
        price: 29000,
        originalPrice: 49000,
        features: [
            'Tracking unlimited',
            'Tanpa iklan',
            'AI Assistant unlimited',
            'Share as Image',
            'Riwayat tracking tersimpan',
            'Prioritas support',
        ],
        popular: true,
        durationDays: 30,
    },
    {
        id: 'pro-yearly',
        name: 'Pro Tahunan',
        type: 'yearly',
        price: 199000,
        originalPrice: 348000,
        features: [
            'Semua fitur Pro Bulanan',
            'Hemat 43%',
            'Badge Pro Member',
            'Early access fitur baru',
            'API access (coming soon)',
        ],
        durationDays: 365,
    },
    {
        id: 'pro-lifetime',
        name: 'Pro Lifetime',
        type: 'lifetime',
        price: 499000,
        originalPrice: 999000,
        features: [
            'Akses selamanya',
            'Semua fitur Pro',
            'Semua update gratis',
            'Prioritas support selamanya',
            'API access priority',
        ],
        durationDays: null,
    },
]

// Get plan by ID
export function getPlanById(planId: string): PlanConfig | undefined {
    return pricingPlans.find(p => p.id === planId)
}

// Get non-free plans
export function getPaidPlans(): PlanConfig[] {
    return pricingPlans.filter(p => p.price > 0)
}

// ============================================
// PAYMENT GATEWAY INTERFACE
// ============================================
// Implement this interface for each payment gateway

export interface PaymentGatewayService {
    name: PaymentGateway
    createPayment(request: PaymentRequest, plan: PlanConfig): Promise<PaymentResult>
    verifyWebhook(payload: any, signature: string): boolean
    handleCallback(payload: any): Promise<{
        success: boolean
        transactionId: string
        status: 'success' | 'pending' | 'failed'
        metadata?: Record<string, any>
    }>
}

// ============================================
// MANUAL PAYMENT (MVP)
// ============================================
// For MVP: WhatsApp-based manual payment

export const manualPaymentConfig = {
    whatsappNumber: '6281234567890', // TODO: Replace with real number
    bankAccounts: [
        {
            bank: 'BCA',
            accountNumber: '1234567890',
            accountName: 'PT CekKirim Indonesia',
        },
        {
            bank: 'Mandiri',
            accountNumber: '0987654321',
            accountName: 'PT CekKirim Indonesia',
        },
    ],
    ewallets: [
        { name: 'GoPay', number: '081234567890' },
        { name: 'OVO', number: '081234567890' },
        { name: 'DANA', number: '081234567890' },
    ],
}

// Generate WhatsApp message for upgrade
export function generateWhatsAppUpgradeUrl(plan: PlanConfig, userEmail?: string): string {
    const message = encodeURIComponent(
        `Halo Admin CekKirim! 👋\n\n` +
        `Saya ingin upgrade ke paket *${plan.name}* (Rp ${plan.price.toLocaleString('id-ID')})\n\n` +
        `Email: ${userEmail || '(belum login)'}\n` +
        `Plan: ${plan.id}\n\n` +
        `Mohon info cara pembayarannya. Terima kasih! 🙏`
    )

    return `https://wa.me/${manualPaymentConfig.whatsappNumber}?text=${message}`
}
