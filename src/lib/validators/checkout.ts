import { z } from 'zod';

// ==========================================
// Zod Validation Schemas for Marketplace
// ==========================================

/**
 * Checkout Request Schema
 * Validates all incoming checkout requests
 */
export const CheckoutSchema = z.object({
    user_id: z.string().uuid({ message: 'Invalid user ID format' }),

    payment_method: z.enum(['WALLET', 'QRIS', 'VA_BCA', 'VA_BNI', 'VA_MANDIRI'], {
        errorMap: () => ({ message: 'Invalid payment method' }),
    }),

    items: z
        .array(
            z.object({
                product_id: z.string().uuid({ message: 'Invalid product ID' }),
                qty: z
                    .number()
                    .int({ message: 'Quantity must be a whole number' })
                    .positive({ message: 'Quantity must be greater than 0' })
                    .min(1, { message: 'Minimum quantity is 1' })
                    .max(10000, { message: 'Maximum quantity is 10,000' }),
            })
        )
        .min(1, { message: 'Cart cannot be empty - at least 1 item required' })
        .max(50, { message: 'Maximum 50 items per order' }),

    shipping_address: z
        .object({
            name: z.string().min(3).max(100),
            phone: z.string().min(10).max(15).regex(/^[0-9+]+$/),
            address: z.string().min(10).max(500),
            city: z.string().min(3).max(100),
            postal_code: z.string().min(5).max(10).regex(/^[0-9]+$/),
        })
        .optional(),

    target_input: z
        .object({
            link: z
                .string()
                .min(3, { message: 'Link too short' })
                .max(255, { message: 'Link too long' })
                .optional(),
            instagram_username: z
                .string()
                .min(1)
                .max(30)
                .regex(/^[a-zA-Z0-9._]+$/, { message: 'Invalid Instagram username format' })
                .optional(),
            tiktok_url: z.string().url({ message: 'Invalid TikTok URL' }).optional(),
        })
        .optional(),
});

/**
 * Admin Update Tracking Schema
 * Validates tracking number update requests
 */
export const UpdateTrackingSchema = z.object({
    order_id: z.string().uuid({ message: 'Invalid order ID' }),
    resi_number: z
        .string()
        .min(5, { message: 'Tracking number too short' })
        .max(50, { message: 'Tracking number too long' })
        .regex(/^[A-Z0-9\-]+$/i, { message: 'Invalid tracking number format' }),
    courier_name: z.enum(['jne', 'jnt', 'sicepat', 'anteraja', 'ninja', 'idexpress', 'pos'], {
        errorMap: () => ({ message: 'Invalid courier name' }),
    }),
    notes: z.string().max(500).optional(),
});

/**
 * Product ID Validation
 */
export const ProductIdSchema = z.string().uuid();

/**
 * Order ID Validation
 */
export const OrderIdSchema = z.string().uuid();

/**
 * Quantity Validation
 */
export const QuantitySchema = z
    .number()
    .int()
    .positive()
    .min(1)
    .max(10000);

// ==========================================
// Export Type Inference
// ==========================================

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
export type UpdateTrackingInput = z.infer<typeof UpdateTrackingSchema>;
