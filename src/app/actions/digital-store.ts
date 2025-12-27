'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'
import { nanoid } from 'nanoid'

// Get all active digital products
export const getDigitalProducts = async (category?: string) => {
    return safeAction(async () => {
        const supabase = await createClient()

        let query = supabase
            .from('digital_products')
            .select('*')
            .eq('is_active', true)

        if (category) {
            query = query.eq('category', category)
        }

        const { data } = await query.order('created_at', { ascending: false })
        return data || []
    })
}

// Get single product details
export const getProductById = async (productId: string) => {
    return safeAction(async () => {
        const supabase = await createClient()

        const { data } = await supabase
            .from('digital_products')
            .select('*')
            .eq('id', productId)
            .eq('is_active', true)
            .single()

        return data
    })
}

// Check if user has purchased a product
export const checkUserPurchase = async (productId: string) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { purchased: false, purchase: null }

        const { data: purchase } = await supabase
            .from('user_purchases')
            .select('*')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .eq('payment_status', 'paid')
            .single()

        return {
            purchased: !!purchase,
            purchase
        }
    })
}

// Get user's purchases
export const getUserPurchases = async () => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error('Not authenticated')

        const { data } = await supabase
            .from('user_purchases')
            .select('*, digital_products(*)')
            .eq('user_id', user.id)
            .order('purchased_at', { ascending: false })

        return data || []
    })
}

// Purchase product (Simulated payment for now)
export const purchaseProduct = async (productId: string) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error('Please login to purchase')

        // Get product details
        const { data: product } = await supabase
            .from('digital_products')
            .select('*')
            .eq('id', productId)
            .single()

        if (!product) throw new Error('Product not found')

        // Check if already purchased
        const { data: existingPurchase } = await supabase
            .from('user_purchases')
            .select('*')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .single()

        if (existingPurchase) {
            throw new Error('You have already purchased this product')
        }

        // Create purchase record (simulated payment - auto set to paid)
        const transactionId = `TXN-${nanoid(10)}`

        const { data: purchase, error } = await supabase
            .from('user_purchases')
            .insert({
                user_id: user.id,
                product_id: productId,
                purchase_price: product.price,
                payment_status: 'paid', // SIMULATED - in production, set to 'pending' first
                payment_method: 'simulate',
                transaction_id: transactionId
            })
            .select()
            .single()

        if (error) throw error

        return {
            success: true,
            purchase,
            transaction_id: transactionId
        }
    })
}

// Generate secure download URL
export const getSecureDownloadUrl = async (productId: string) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error('Please login to download')

        // Verify purchase
        const { data: purchase } = await supabase
            .from('user_purchases')
            .select('*, digital_products(*)')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .eq('payment_status', 'paid')
            .single()

        if (!purchase) {
            throw new Error('You have not purchased this product')
        }

        // Log download
        await supabase.from('product_downloads').insert({
            purchase_id: purchase.id,
            user_id: user.id,
            product_id: productId
        })

        // Generate signed URL from Supabase Storage (private bucket)
        // URL expires in 1 hour (3600 seconds)
        const { data: urlData } = await supabase.storage
            .from('digital-products') // private bucket name
            .createSignedUrl(purchase.digital_products.file_url, 3600)

        if (!urlData?.signedUrl) {
            throw new Error('Failed to generate download link')
        }

        return {
            downloadUrl: urlData.signedUrl,
            expiresIn: 3600,
            product: purchase.digital_products
        }
    })
}
