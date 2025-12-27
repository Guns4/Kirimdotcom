'use server';

import { createClient } from '@/utils/supabase/server';

/**
 * Get order data for invoice
 */
export async function getOrderForInvoice(orderId: string) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        // Get order with items
        const { data: order, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('user_id', user.id)
            .single();

        if (error) {
            return { data: null, error: 'Order not found' };
        }

        // Get user profile for seller info
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, phone, business_name')
            .eq('id', user.id)
            .single();

        return {
            data: {
                order,
                seller: {
                    name: profile?.business_name || profile?.full_name || 'Toko Saya',
                    phone: profile?.phone,
                    email: user.email,
                },
            },
            error: null,
        };
    } catch (error) {
        console.error('Error fetching order:', error);
        return { data: null, error: 'Failed to fetch order' };
    }
}

/**
 * Generate invoice number
 */
export async function generateInvoiceNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();

    return `INV/${year}${month}${day}/${random}`;
}

/**
 * Save invoice record
 */
export async function saveInvoiceRecord(data: {
    orderId?: string;
    invoiceNumber: string;
    customerName: string;
    customerPhone?: string;
    totalAmount: number;
    pdfUrl?: string;
}) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { error } = await supabase.from('invoices').insert({
            user_id: user.id,
            order_id: data.orderId,
            invoice_number: data.invoiceNumber,
            customer_name: data.customerName,
            customer_phone: data.customerPhone,
            total_amount: data.totalAmount,
            pdf_url: data.pdfUrl,
            status: 'created',
        });

        if (error) {
            console.error('Error saving invoice:', error);
            return { success: false, error: 'Failed to save invoice' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error in saveInvoiceRecord:', error);
        return { success: false, error: 'System error' };
    }
}

/**
 * Get user's invoices
 */
export async function getInvoices(limit: number = 50) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        return { data, error };
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return { data: null, error: 'Failed to fetch invoices' };
    }
}

/**
 * Send invoice via WhatsApp (returns WA link)
 */
export function getWhatsAppInvoiceLink(
    phone: string,
    invoiceNumber: string,
    totalAmount: number,
    pdfUrl?: string
): string {
    const formattedTotal = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(totalAmount);

    let message = `Halo Kak! 👋

Berikut invoice untuk pesanan Anda:

📄 *Invoice: ${invoiceNumber}*
💰 Total: *${formattedTotal}*

`;

    if (pdfUrl) {
        message += `📎 Download Invoice: ${pdfUrl}\n\n`;
    }

    message += `Terima kasih sudah berbelanja! 🙏`;

    // Clean phone number
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
        cleanPhone = '62' + cleanPhone.substring(1);
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Get mailto link for invoice email
 */
export function getEmailInvoiceLink(
    email: string,
    invoiceNumber: string,
    totalAmount: number
): string {
    const formattedTotal = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(totalAmount);

    const subject = `Invoice ${invoiceNumber}`;
    const body = `Yth. Pelanggan,

Terlampir invoice untuk pesanan Anda:

Invoice: ${invoiceNumber}
Total: ${formattedTotal}

Terima kasih atas kepercayaan Anda.

Salam,
Tim Kami`;

    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
