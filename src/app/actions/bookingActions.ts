'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

interface BookingResult {
    success: boolean;
    bookingId?: string;
    bookingCode?: string;
    finalPrice?: number;
    message?: string;
    error?: string;
}

/**
 * Calculate shipping price with markup
 */
export async function calculateShippingPrice(
    courier: string,
    basePrice: number
) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase.rpc('calculate_shipping_price', {
            p_courier: courier,
            p_base_price: basePrice,
        });

        if (error || !data || data.length === 0) {
            // Default markup
            const markup = basePrice * 0.08;
            return {
                basePrice,
                markupPercent: 8.0,
                markupAmount: Math.max(markup, 1000),
                finalPrice: basePrice + Math.max(markup, 1000),
            };
        }

        return data[0];
    } catch (error) {
        console.error('Error calculating price:', error);
        return null;
    }
}

/**
 * Create shipping booking
 */
export async function createShippingBooking(booking: {
    courier: string;
    serviceType: string;
    sender: {
        name: string;
        phone: string;
        address: string;
        city: string;
    };
    recipient: {
        name: string;
        phone: string;
        address: string;
        city: string;
    };
    package: {
        weight: number;
        description?: string;
    };
    basePrice: number;
    pickupDate?: string;
}): Promise<BookingResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { data, error } = await supabase.rpc('create_shipping_booking', {
            p_user_id: user.id,
            p_courier: booking.courier,
            p_service_type: booking.serviceType,
            p_sender: JSON.stringify(booking.sender),
            p_recipient: JSON.stringify(booking.recipient),
            p_package: JSON.stringify(booking.package),
            p_base_price: booking.basePrice,
            p_pickup_date: booking.pickupDate || null,
        });

        if (error || !data || data.length === 0) {
            return { success: false, error: 'Failed to create booking' };
        }

        const result = data[0];

        if (!result.success) {
            return { success: false, error: result.message };
        }

        revalidatePath('/dashboard/bookings');
        return {
            success: true,
            bookingId: result.booking_id,
            bookingCode: result.booking_code,
            finalPrice: result.final_price,
            message: result.message,
        };
    } catch (error) {
        console.error('Error creating booking:', error);
        return { success: false, error: 'System error' };
    }
}

/**
 * Get my bookings
 */
export async function getMyBookings(status?: string) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        let query = supabase
            .from('shipping_bookings')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query.limit(100);

        return { data, error };
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return { data: null, error: 'Failed to fetch bookings' };
    }
}

/**
 * Get booking details
 */
export async function getBookingDetails(bookingId: string) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('shipping_bookings')
            .select('*')
            .eq('id', bookingId)
            .eq('user_id', user.id)
            .single();

        return { data, error };
    } catch (error) {
        console.error('Error fetching booking:', error);
        return { data: null, error: 'Failed to fetch booking' };
    }
}

/**
 * Cancel booking (refund to wallet)
 */
export async function cancelBooking(bookingId: string) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Get booking
        const { data: booking } = await supabase
            .from('shipping_bookings')
            .select('*')
            .eq('id', bookingId)
            .eq('user_id', user.id)
            .single();

        if (!booking) {
            return { success: false, error: 'Booking not found' };
        }

        if (booking.status !== 'confirmed' && booking.status !== 'pending') {
            return { success: false, error: 'Cannot cancel - already in process' };
        }

        // Refund to wallet
        const { data: wallet } = await supabase
            .from('wallets')
            .select('id, balance')
            .eq('user_id', user.id)
            .single();

        if (wallet) {
            const refundAmount = booking.final_price * 100; // Convert to cents

            await supabase
                .from('wallets')
                .update({
                    balance: wallet.balance + refundAmount,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', wallet.id);

            // Log refund
            await supabase.from('wallet_transactions').insert({
                wallet_id: wallet.id,
                type: 'credit',
                amount: refundAmount,
                balance_before: wallet.balance,
                balance_after: wallet.balance + refundAmount,
                description: `Refund booking ${booking.booking_code}`,
                reference_id: booking.booking_code,
            });
        }

        // Update booking status
        await supabase
            .from('shipping_bookings')
            .update({
                status: 'cancelled',
                updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId);

        revalidatePath('/dashboard/bookings');
        return { success: true, message: 'Booking cancelled and refunded' };
    } catch (error) {
        console.error('Error cancelling booking:', error);
        return { success: false, error: 'System error' };
    }
}

/**
 * Get wallet balance for booking
 */
export async function getWalletBalance() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { balance: 0, error: 'Not authenticated' };
        }

        const { data } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', user.id)
            .single();

        return { balance: (data?.balance || 0) / 100, error: null }; // Convert from cents
    } catch (error) {
        console.error('Error fetching balance:', error);
        return { balance: 0, error: 'Failed to fetch balance' };
    }
}

/**
 * Format currency
 */
export function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}
