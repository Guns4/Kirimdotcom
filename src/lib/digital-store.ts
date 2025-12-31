import { createClient } from '@/utils/supabase/server';

export interface DigitalProduct {
    id: string;
    title: string;
    description: string;
    price: number;
    product_type: 'TEMPLATE' | 'EBOOK' | 'SOFTWARE' | 'COURSE' | 'OTHER';
    thumbnail_url: string;
    file_path: string;
}

export interface UserAsset {
    id: string;
    product: DigitalProduct;
    download_count: number;
    max_downloads: number;
    created_at: string;
}

export async function getUserAssets(userId: string): Promise<UserAsset[]> {
    const supabase = await createClient();

    const { data, error } = await (supabase as any)
        .from('user_assets')
        .select(`
            id,
            download_count,
            max_downloads,
            created_at,
            product:digital_products (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching assets:', error);
        return [];
    }

    return data as UserAsset[];
}

export async function generateDownloadLink(assetId: string, userId: string): Promise<{ url?: string; error?: string }> {
    const supabase = await createClient();

    // 1. Verify Ownership & Limits
    const { data: asset, error: assetError } = await (supabase as any)
        .from('user_assets')
        .select('*, product:digital_products(file_path)')
        .eq('id', assetId)
        .eq('user_id', userId)
        .single();

    if (assetError || !asset) return { error: 'Asset not found or unauthorized' };

    if (asset.download_count >= asset.max_downloads) {
        return { error: 'Download limit reached. Please contact support.' };
    }

    // 2. Increment Download Count
    await (supabase as any)
        .from('user_assets')
        .update({
            download_count: asset.download_count + 1,
            last_download_at: new Date().toISOString()
        })
        .eq('id', assetId);

    // 3. Generate Signed URL (Expire in 24h = 86400s)
    const { data: signedData, error: signError } = await supabase
        .storage
        .from('digital-assets')
        .createSignedUrl(asset.product.file_path, 60 * 60 * 24);

    if (signError || !signedData) {
        return { error: 'Failed to generate download link' };
    }

    return { url: signedData.signedUrl };
}
