// SaaS Billing Service
// Recurring billing logic, expiry checks, and invoice automation

export interface SubscriptionStatus {
    isActive: boolean;
    daysRemaining: number;
    status: 'ACTIVE' | 'EXPIRED' | 'WARNING';
    redirectUrl?: string; // If expired
}

// 1. Check Subscription Status
// Used by Middleware to gate access
export async function checkSubscriptionStatus(tenantId: string): Promise<SubscriptionStatus> {
    // In production: Query DB
    // const { data: sub } = await supabase.from('saas_subscriptions').select('*').eq('tenant_id', tenantId).single();

    // Mock Logic
    const mockExpiry = new Date();
    mockExpiry.setDate(mockExpiry.getDate() + 5); // Expires in 5 days

    const now = new Date();
    const daysRemaining = Math.ceil((mockExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
        return {
            isActive: false,
            daysRemaining: 0,
            status: 'EXPIRED',
            redirectUrl: '/renew-subscription'
        };
    }

    if (daysRemaining <= 7) {
        return {
            isActive: true, // Still active but warn
            daysRemaining,
            status: 'WARNING'
        };
    }

    return {
        isActive: true,
        daysRemaining,
        status: 'ACTIVE'
    };
}

// 2. Invoice Generator (Cron Job Mock)
// Runs daily to find expiring subscriptions
export async function generateUpcomingInvoices() {
    console.log('[Billing] Scanning for renewals...');

    // Logic: Find subs expiring in 7 days
    const expiringCount = 3; // Mock

    console.log(`[Billing] Found ${expiringCount} subscriptions renewing in 7 days.`);

    for (let i = 0; i < expiringCount; i++) {
        await createInvoice(`sub-mock-${i}`);
    }
}

async function createInvoice(subId: string) {
    console.log(`[Billing] Generated Invoice for ${subId}: Rp 150.000 (Due H-7)`);
    // Send email here
    sendExpiryEmail(subId);
}

// 3. Email Automation
export function sendExpiryEmail(subId: string) {
    console.log(`[Email] Sending renewal reminder for ${subId}... Sent! 📧`);
}

// 4. Manual Renewal
export async function renewSubscription(tenantId: string, planId: string) {
    console.log(`[Billing] Renewing subscription for ${tenantId} on plan ${planId}`);
    return { success: true, newExpiry: '2026-01-30' };
}
