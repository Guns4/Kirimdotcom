// Shop Branding Service
// Custom themed tracking pages for sellers

export interface ShopBranding {
    id: string;
    userId: string;
    shopId: string;
    shopName: string;

    // Assets
    logoUrl?: string;
    bannerUrl?: string;
    faviconUrl?: string;

    // Colors
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;

    // Content
    tagline?: string;
    footerText?: string;
    whatsappNumber?: string;
    instagramHandle?: string;

    // Ad
    adBannerUrl?: string;
    adBannerLink?: string;

    // Subscription
    subscriptionStatus: 'FREE' | 'BRANDING_PRO';
    subscriptionExpiresAt?: Date;

    isActive: boolean;
}

// Pricing
export const BRANDING_PRICING = {
    BRANDING_PRO: {
        monthly: 20000,
        yearly: 200000, // 2 months free
        features: [
            'Custom Logo',
            'Custom Colors',
            'Banner Iklan Sendiri',
            'Remove "Powered by CekKirim"',
            'Custom Domain (Coming Soon)'
        ]
    }
};

// Default branding (for unsubscribed users)
export const DEFAULT_BRANDING: Partial<ShopBranding> = {
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    footerText: 'Powered by CekKirim.com'
};

// Get branding by shop ID
export async function getBrandingByShopId(shopId: string): Promise<ShopBranding | null> {
    // In production: Query from Supabase
    // const { data } = await supabase.from('shop_branding').select('*').eq('shop_id', shopId);

    // Mock data
    return {
        id: '1',
        userId: 'user1',
        shopId,
        shopName: 'Toko Contoh',
        logoUrl: '/logo-sample.png',
        primaryColor: '#8B5CF6',
        secondaryColor: '#EC4899',
        accentColor: '#F59E0B',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        tagline: 'Belanja Mudah, Kirim Cepat!',
        whatsappNumber: '6281234567890',
        subscriptionStatus: 'BRANDING_PRO',
        isActive: true
    };
}

// Check if branding features are unlocked
export function isBrandingUnlocked(branding: ShopBranding): boolean {
    if (branding.subscriptionStatus !== 'BRANDING_PRO') return false;
    if (branding.subscriptionExpiresAt && new Date(branding.subscriptionExpiresAt) < new Date()) {
        return false;
    }
    return true;
}

// Generate CSS variables from branding
export function generateCSSVariables(branding: Partial<ShopBranding>): Record<string, string> {
    return {
        '--brand-primary': branding.primaryColor || DEFAULT_BRANDING.primaryColor!,
        '--brand-secondary': branding.secondaryColor || DEFAULT_BRANDING.secondaryColor!,
        '--brand-accent': branding.accentColor || DEFAULT_BRANDING.accentColor!,
        '--brand-bg': branding.backgroundColor || DEFAULT_BRANDING.backgroundColor!,
        '--brand-text': branding.textColor || DEFAULT_BRANDING.textColor!,
    };
}

// Validate hex color
export function isValidHexColor(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
}

// Save branding settings
export async function saveBranding(
    userId: string,
    branding: Partial<ShopBranding>
): Promise<{ success: boolean; error?: string }> {
    // Validate colors
    const colors = ['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor', 'textColor'];
    for (const colorKey of colors) {
        const color = branding[colorKey as keyof typeof branding] as string;
        if (color && !isValidHexColor(color)) {
            return { success: false, error: `Invalid ${colorKey}: ${color}` };
        }
    }

    // In production: Save to Supabase
    // await supabase.from('shop_branding').upsert({ ...branding, user_id: userId });

    return { success: true };
}

// Upload asset (logo/banner)
export async function uploadBrandingAsset(
    userId: string,
    file: File,
    type: 'logo' | 'banner' | 'favicon'
): Promise<{ url?: string; error?: string }> {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        return { error: 'File harus berupa gambar' };
    }

    // Validate file size (max 2MB for logo, 5MB for banner)
    const maxSize = type === 'banner' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
        return { error: `Ukuran file maksimal ${maxSize / 1024 / 1024}MB` };
    }

    // In production: Upload to Supabase Storage
    // const { data, error } = await supabase.storage.from('branding').upload(`${userId}/${type}`, file);

    return { url: URL.createObjectURL(file) };
}

// Format price
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price);
}
