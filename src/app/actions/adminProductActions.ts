'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/adminAuth';

interface ProductResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}

/**
 * Create product
 */
export async function createProduct(
    title: string,
    description: string,
    price: number,
    coverImageUrl: string,
    productFileUrl: string,
    category: string
): Promise<ProductResult> {
    try {
        await requireAdmin();

        const supabase = await createClient();

        const { data, error } = await supabase
            .from('digital_products')
            .insert({
                title,
                description,
                price,
                cover_image_url: coverImageUrl,
                product_file_url: productFileUrl,
                category,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating product:', error);
            return {
                success: false,
                message: 'Failed to create product',
                error: 'CREATE_FAILED',
            };
        }

        revalidatePath('/admin/products');
        revalidatePath('/shop');

        return {
            success: true,
            message: 'Product created successfully!',
            data,
        };
    } catch (error) {
        console.error('Error in createProduct:', error);
        return {
            success: false,
            message: 'System error',
            error: 'SYSTEM_ERROR',
        };
    }
}

/**
 * Update product
 */
export async function updateProduct(
    productId: string,
    updates: {
        title?: string;
        description?: string;
        price?: number;
        coverImageUrl?: string;
        productFileUrl?: string;
        category?: string;
    }
): Promise<ProductResult> {
    try {
        await requireAdmin();

        const supabase = await createClient();

        const updateData: any = {};
        if (updates.title) updateData.title = updates.title;
        if (updates.description) updateData.description = updates.description;
        if (updates.price !== undefined) updateData.price = updates.price;
        if (updates.coverImageUrl) updateData.cover_image_url = updates.coverImageUrl;
        if (updates.productFileUrl) updateData.product_file_url = updates.productFileUrl;
        if (updates.category) updateData.category = updates.category;

        const { data, error } = await supabase
            .from('digital_products')
            .update(updateData)
            .eq('id', productId)
            .select()
            .single();

        if (error) {
            console.error('Error updating product:', error);
            return {
                success: false,
                message: 'Failed to update product',
                error: 'UPDATE_FAILED',
            };
        }

        revalidatePath('/admin/products');
        revalidatePath('/shop');

        return {
            success: true,
            message: 'Product updated successfully!',
            data,
        };
    } catch (error) {
        console.error('Error in updateProduct:', error);
        return {
            success: false,
            message: 'System error',
            error: 'SYSTEM_ERROR',
        };
    }
}

/**
 * Soft delete product
 */
export async function deleteProduct(productId: string): Promise<ProductResult> {
    try {
        await requireAdmin();

        const supabase = await createClient();

        const { data, error } = await supabase
            .from('digital_products')
            .update({ is_active: false })
            .eq('id', productId)
            .select()
            .single();

        if (error) {
            console.error('Error deleting product:', error);
            return {
                success: false,
                message: 'Failed to delete product',
                error: 'DELETE_FAILED',
            };
        }

        revalidatePath('/admin/products');
        revalidatePath('/shop');

        return {
            success: true,
            message: 'Product deleted successfully!',
            data,
        };
    } catch (error) {
        console.error('Error in deleteProduct:', error);
        return {
            success: false,
            message: 'System error',
            error: 'SYSTEM_ERROR',
        };
    }
}

/**
 * Get all products for admin
 */
export async function getAllProductsAdmin() {
    try {
        await requireAdmin();

        const supabase = await createClient();

        const { data, error } = await supabase
            .from('digital_products')
            .select('*')
            .order('created_at', { ascending: false });

        return { data, error };
    } catch (error) {
        console.error('Error fetching products:', error);
        return { data: null, error: 'Failed to fetch products' };
    }
}

/**
 * Get sales statistics
 */
export async function getSalesStats() {
    try {
        await requireAdmin();

        const supabase = await createClient();

        // Get purchase counts per product
        const { data, error } = await supabase
            .from('digital_purchases')
            .select('product_id, digital_products(title)')
            .eq('status', 'completed');

        if (error) {
            console.error('Error fetching sales stats:', error);
            return { data: null, error };
        }

        // Aggregate by product
        const stats: Record<string, { title: string; count: number }> = {};

        data.forEach((purchase: any) => {
            const productId = purchase.product_id;
            const productTitle = purchase.digital_products?.title || 'Unknown';

            if (!stats[productId]) {
                stats[productId] = { title: productTitle, count: 0 };
            }
            stats[productId].count++;
        });

        // Convert to array and sort
        const salesData = Object.entries(stats)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.count - a.count);

        return { data: salesData, error: null };
    } catch (error) {
        console.error('Error in getSalesStats:', error);
        return { data: null, error: 'Failed to fetch stats' };
    }
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
    file: File,
    bucket: 'product-files' | 'product-covers'
): Promise<{ url: string | null; error: string | null }> {
    try {
        await requireAdmin();

        const supabase = await createClient();

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file);

        if (error) {
            console.error('Upload error:', error);
            return { url: null, error: error.message };
        }

        // Get public URL
        const { data: publicData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        return { url: publicData.publicUrl, error: null };
    } catch (error) {
        console.error('Error in uploadFile:', error);
        return { url: null, error: 'Upload failed' };
    }
}
