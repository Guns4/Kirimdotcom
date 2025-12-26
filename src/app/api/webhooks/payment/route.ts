import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// ============================================
// PAYMENT WEBHOOK HANDLER
// ============================================
// Modular structure ready for any payment gateway

export const runtime = 'edge'

// Supported payment gateways
type PaymentGateway = 'midtrans' | 'xendit' | 'lemonsqueezy' | 'manual'

interface WebhookPayload {
    gateway: PaymentGateway
    event: string
    data: any
}

export async function POST(request: NextRequest) {
    try {
        // Get gateway from query or header
        const { searchParams } = new URL(request.url)
        const gateway = searchParams.get('gateway') as PaymentGateway || 'manual'

        // Parse body
        const body = await request.json()

        // Get signature from header (for verification)
        const signature = request.headers.get('x-callback-token') ||
            request.headers.get('x-signature') ||
            request.headers.get('x-xendit-callback-token') || ''

        // Log webhook (for debugging - remove in production)
        console.log(`[Webhook] Gateway: ${gateway}, Event: ${body.event || 'unknown'}`)

        // Route to appropriate handler
        let result
        switch (gateway) {
            case 'midtrans':
                result = await handleMidtransWebhook(body, signature)
                break
            case 'xendit':
                result = await handleXenditWebhook(body, signature)
                break
            case 'lemonsqueezy':
                result = await handleLemonSqueezyWebhook(body, signature)
                break
            case 'manual':
                result = await handleManualPayment(body)
                break
            default:
                return NextResponse.json({ error: 'Unknown gateway' }, { status: 400 })
        }

        return NextResponse.json(result)

    } catch (error) {
        console.error('[Webhook Error]', error)
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        )
    }
}

// ============================================
// MIDTRANS HANDLER (Placeholder)
// ============================================
async function handleMidtransWebhook(body: any, signature: string) {
    // TODO: Implement Midtrans signature verification
    // const isValid = verifyMidtransSignature(body, signature)

    // TODO: Implement Midtrans status handling
    // const { order_id, transaction_status, fraud_status } = body

    // if (transaction_status === 'capture' || transaction_status === 'settlement') {
    //   await activateSubscription(order_id)
    // }

    return {
        success: true,
        message: 'Midtrans webhook received (not implemented yet)',
        gateway: 'midtrans',
    }
}

// ============================================
// XENDIT HANDLER (Placeholder)
// ============================================
async function handleXenditWebhook(body: any, signature: string) {
    // TODO: Implement Xendit signature verification
    // const isValid = verifyXenditSignature(body, signature, process.env.XENDIT_CALLBACK_TOKEN)

    // TODO: Implement Xendit status handling
    // const { external_id, status, paid_amount } = body

    // if (status === 'PAID') {
    //   await activateSubscription(external_id)
    // }

    return {
        success: true,
        message: 'Xendit webhook received (not implemented yet)',
        gateway: 'xendit',
    }
}

// ============================================
// LEMONSQUEEZY HANDLER (Placeholder)
// ============================================
async function handleLemonSqueezyWebhook(body: any, signature: string) {
    // TODO: Implement LemonSqueezy signature verification
    // const isValid = verifyLemonSqueezySignature(body, signature, process.env.LS_SIGNING_SECRET)

    // TODO: Implement LemonSqueezy status handling
    // if (body.meta?.event_name === 'order_created') {
    //   const orderId = body.data.id
    //   await activateSubscription(orderId)
    // }

    return {
        success: true,
        message: 'LemonSqueezy webhook received (not implemented yet)',
        gateway: 'lemonsqueezy',
    }
}

// ============================================
// MANUAL PAYMENT HANDLER (Admin use)
// ============================================
async function handleManualPayment(body: any) {
    const { userId, planId, transactionId, adminSecret } = body

    // Verify admin secret
    if (adminSecret !== process.env.ADMIN_SECRET) {
        return {
            success: false,
            error: 'Invalid admin secret',
        }
    }

    // TODO: Implement manual activation
    // await activateSubscription(userId, planId)

    return {
        success: true,
        message: 'Manual payment processed',
        gateway: 'manual',
        userId,
        planId,
    }
}

// ============================================
// HELPER: Activate Subscription
// ============================================
async function activateSubscription(
    userId: string,
    planId: string,
    transactionId?: string,
    gateway?: PaymentGateway
) {
    const supabase = await createClient()

    // Calculate end date based on plan
    const planDurations: Record<string, number> = {
        'pro-monthly': 30,
        'pro-yearly': 365,
        'pro-lifetime': 36500, // ~100 years
    }

    const durationDays = planDurations[planId] || 30
    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000)

    // Create or update subscription
    // Note: Using 'as any' until types are regenerated after running SQL schema
    const { error } = await (supabase as any)
        .from('subscriptions')
        .upsert({
            user_id: userId,
            plan_type: planId.includes('monthly') ? 'monthly' :
                planId.includes('yearly') ? 'yearly' : 'lifetime',
            plan_name: 'Pro',
            status: 'active',
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            payment_gateway: gateway || 'manual',
            last_payment_id: transactionId,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id',
        })

    if (error) {
        console.error('Subscription activation error:', error)
        throw error
    }

    return true
}
