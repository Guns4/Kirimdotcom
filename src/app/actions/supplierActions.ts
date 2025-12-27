'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Search suppliers
 */
export async function searchSuppliers(filters?: {
    category?: string;
    city?: string;
    province?: string;
    search?: string;
    verifiedOnly?: boolean;
    limit?: number;
    offset?: number;
}) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase.rpc('search_suppliers', {
            p_category: filters?.category || null,
            p_city: filters?.city || null,
            p_province: filters?.province || null,
            p_search: filters?.search || null,
            p_verified_only: filters?.verifiedOnly || false,
            p_limit: filters?.limit || 20,
            p_offset: filters?.offset || 0,
        });

        return { data, error };
    } catch (error) {
        console.error('Error searching suppliers:', error);
        return { data: null, error: 'Failed to search suppliers' };
    }
}

/**
 * Get supplier details
 */
export async function getSupplierDetails(supplierId: string) {
    try {
        const supabase = await createClient();

        // Increment view count
        await supabase.rpc('increment_supplier_views', {
            p_supplier_id: supplierId,
        });

        const { data: supplier, error } = await supabase
            .from('suppliers')
            .select('*')
            .eq('id', supplierId)
            .eq('is_active', true)
            .single();

        if (error) {
            return { data: null, error: 'Supplier not found' };
        }

        // Get products
        const { data: products } = await supabase
            .from('supplier_products')
            .select('*')
            .eq('supplier_id', supplierId)
            .eq('is_active', true)
            .limit(20);

        // Get reviews
        const { data: reviews } = await supabase
            .from('supplier_reviews')
            .select('*')
            .eq('supplier_id', supplierId)
            .eq('is_visible', true)
            .order('created_at', { ascending: false })
            .limit(10);

        return {
            data: {
                ...supplier,
                products: products || [],
                reviews: reviews || [],
            },
            error: null,
        };
    } catch (error) {
        console.error('Error fetching supplier:', error);
        return { data: null, error: 'System error' };
    }
}

/**
 * Get categories
 */
export async function getSupplierCategories() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('supplier_categories')
            .select('*')
            .eq('is_active', true)
            .order('display_order');

        return { data, error };
    } catch (error) {
        console.error('Error fetching categories:', error);
        return { data: null, error: 'Failed to fetch categories' };
    }
}

/**
 * Apply as reseller
 */
export async function applyAsReseller(
    supplierId: string,
    application: {
        name: string;
        phone: string;
        email?: string;
        city?: string;
        businessName?: string;
        businessType?: string;
        marketplaceLinks?: string[];
        message?: string;
    }
) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Please login to apply' };
        }

        // Check for existing application
        const { data: existing } = await supabase
            .from('reseller_applications')
            .select('id')
            .eq('supplier_id', supplierId)
            .eq('user_id', user.id)
            .single();

        if (existing) {
            return { success: false, error: 'You have already applied to this supplier' };
        }

        const { error } = await supabase.from('reseller_applications').insert({
            supplier_id: supplierId,
            user_id: user.id,
            applicant_name: application.name,
            applicant_phone: application.phone,
            applicant_email: application.email,
            applicant_city: application.city,
            business_name: application.businessName,
            business_type: application.businessType,
            marketplace_links: application.marketplaceLinks,
            message: application.message,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, message: 'Application submitted!' };
    } catch (error) {
        console.error('Error applying:', error);
        return { success: false, error: 'System error' };
    }
}

/**
 * Upgrade to supplier
 */
export async function upgradeToSupplier(supplierData: {
    businessName: string;
    businessDescription?: string;
    contactPhone: string;
    contactWhatsapp?: string;
    province?: string;
    city?: string;
    categories: string[];
    minOrderQty?: number;
    resellerRequirements?: string;
    resellerBenefits?: string[];
}) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Check if already a supplier
        const { data: existing } = await supabase
            .from('suppliers')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (existing) {
            return { success: false, error: 'You are already registered as a supplier' };
        }

        const { error } = await supabase.from('suppliers').insert({
            user_id: user.id,
            business_name: supplierData.businessName,
            business_description: supplierData.businessDescription,
            contact_phone: supplierData.contactPhone,
            contact_whatsapp: supplierData.contactWhatsapp || supplierData.contactPhone,
            province: supplierData.province,
            city: supplierData.city,
            categories: supplierData.categories,
            min_order_qty: supplierData.minOrderQty || 1,
            reseller_requirements: supplierData.resellerRequirements,
            reseller_benefits: supplierData.resellerBenefits,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath('/suppliers');
        return { success: true, message: 'Supplier profile created!' };
    } catch (error) {
        console.error('Error upgrading to supplier:', error);
        return { success: false, error: 'System error' };
    }
}

/**
 * Get WhatsApp link for supplier
 */
export function getSupplierWhatsAppLink(
    whatsapp: string,
    supplierName: string
): string {
    let phone = whatsapp.replace(/\D/g, '');
    if (phone.startsWith('0')) {
        phone = '62' + phone.substring(1);
    }

    const message = `Halo Kak, saya ingin tanya tentang jadi reseller di ${supplierName}.\n\nSaya menemukan toko ini di CekKirim.com 🙏`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Get my supplier profile
 */
export async function getMySupplierProfile() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('suppliers')
            .select('*')
            .eq('user_id', user.id)
            .single();

        return { data, error };
    } catch (error) {
        console.error('Error fetching supplier profile:', error);
        return { data: null, error: 'System error' };
    }
}

/**
 * Get reseller applications (for suppliers)
 */
export async function getResellerApplications() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        // Get supplier
        const { data: supplier } = await supabase
            .from('suppliers')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!supplier) {
            return { data: null, error: 'Not a supplier' };
        }

        const { data, error } = await supabase
            .from('reseller_applications')
            .select('*')
            .eq('supplier_id', supplier.id)
            .order('created_at', { ascending: false });

        return { data, error };
    } catch (error) {
        console.error('Error fetching applications:', error);
        return { data: null, error: 'System error' };
    }
}
