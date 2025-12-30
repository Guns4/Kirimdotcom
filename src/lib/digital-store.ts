// Digital Store Service
// Templates, Ebooks & Digital Products with Signed URL Delivery

import crypto from 'crypto';

export interface DigitalProduct {
    id: string;
    sellerId: string;
    name: string;
    description?: string;
    category: 'TEMPLATE' | 'EBOOK' | 'SOFTWARE' | 'COURSE' | 'OTHER';
    thumbnailUrl?: string;
    price: number;
    discountPrice?: number;
    isFree: boolean;
    filePath: string;
    fileSize?: number;
    fileType: string;
    downloadCount: number;
    salesCount: number;
    isActive: boolean;
}

export interface DigitalPurchase {
    id: string;
    userId: string;
    productId: string;
    amountPaid: number;
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    downloadCount: number;
    maxDownloads: number;
    emailSent: boolean;
    createdAt: Date;
}

export interface DownloadToken {
    id: string;
    purchaseId: string;
    token: string;
    expiresAt: Date;
    isUsed: boolean;
}

// Category configs
export const CATEGORIES = {
    TEMPLATE: { name: 'Template', icon: '📄', color: 'blue' },
    EBOOK: { name: 'Ebook', icon: '📚', color: 'green' },
    SOFTWARE: { name: 'Software', icon: '💿', color: 'purple' },
    COURSE: { name: 'Course', icon: '🎓', color: 'orange' },
    OTHER: { name: 'Lainnya', icon: '📦', color: 'gray' },
};

// Token expiry duration (24 hours)
const TOKEN_EXPIRY_HOURS = 24;

// Generate secure download token
export function generateDownloadToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

// Create signed download URL
export async function createSignedDownloadUrl(
    purchaseId: string,
    productFilePath: string
): Promise<{ url: string; token: string; expiresAt: Date }> {
    const token = generateDownloadToken();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // In production: Save token to database
    // await supabase.from('download_tokens').insert({
    //     purchase_id: purchaseId,
    //     token,
    //     expires_at: expiresAt.toISOString()
    // });

    // Generate URL
    const url = `/api/download/${token}`;

    return { url, token, expiresAt };
}

// Validate download token
export async function validateDownloadToken(token: string): Promise<{
    valid: boolean;
    purchase?: DigitalPurchase;
    product?: DigitalProduct;
    error?: string;
}> {
    // In production: Query from database
    // const { data } = await supabase.from('download_tokens')
    //     .select('*, purchase:digital_purchases(*), product:digital_products(*)')
    //     .eq('token', token)
    //     .single();

    // Mock validation
    const mockExpiry = new Date(Date.now() + 12 * 60 * 60 * 1000);

    if (token.length < 32) {
        return { valid: false, error: 'Token tidak valid' };
    }

    // Check expiry
    if (mockExpiry < new Date()) {
        return { valid: false, error: 'Token sudah kadaluarsa' };
    }

    return { valid: true };
}

// Process payment and deliver product
export async function processDigitalPurchase(
    userId: string,
    productId: string,
    paymentMethod: string
): Promise<{ success: boolean; purchaseId?: string; downloadUrl?: string; error?: string }> {
    // In production:
    // 1. Create purchase record
    // 2. Process payment
    // 3. Update payment status
    // 4. Generate download token
    // 5. Send email with download link

    const purchaseId = `PUR-${Date.now()}`;
    const { url, token, expiresAt } = await createSignedDownloadUrl(purchaseId, 'path/to/file');

    return {
        success: true,
        purchaseId,
        downloadUrl: url
    };
}

// Get user's purchased products (library)
export async function getUserLibrary(userId: string): Promise<{
    purchase: DigitalPurchase;
    product: DigitalProduct;
}[]> {
    // In production: Query from database with joins
    // const { data } = await supabase.from('digital_purchases')
    //     .select('*, product:digital_products(*)')
    //     .eq('user_id', userId)
    //     .eq('payment_status', 'PAID');

    // Mock data
    return [
        {
            purchase: {
                id: '1',
                userId,
                productId: 'prod1',
                amountPaid: 50000,
                paymentStatus: 'PAID',
                downloadCount: 2,
                maxDownloads: 5,
                emailSent: true,
                createdAt: new Date(Date.now() - 86400000)
            },
            product: {
                id: 'prod1',
                sellerId: 'seller1',
                name: 'Template Invoice Profesional',
                description: 'Template invoice untuk bisnis Anda',
                category: 'TEMPLATE',
                thumbnailUrl: '/template-invoice.jpg',
                price: 50000,
                isFree: false,
                filePath: 'templates/invoice.zip',
                fileType: 'ZIP',
                fileSize: 2500000,
                downloadCount: 150,
                salesCount: 45,
                isActive: true
            }
        },
        {
            purchase: {
                id: '2',
                userId,
                productId: 'prod2',
                amountPaid: 0,
                paymentStatus: 'PAID',
                downloadCount: 1,
                maxDownloads: 5,
                emailSent: true,
                createdAt: new Date(Date.now() - 172800000)
            },
            product: {
                id: 'prod2',
                sellerId: 'seller1',
                name: 'Ebook Panduan Dropship',
                description: 'Panduan lengkap memulai bisnis dropship',
                category: 'EBOOK',
                thumbnailUrl: '/ebook-dropship.jpg',
                price: 0,
                isFree: true,
                filePath: 'ebooks/dropship-guide.pdf',
                fileType: 'PDF',
                fileSize: 5000000,
                downloadCount: 500,
                salesCount: 200,
                isActive: true
            }
        }
    ];
}

// Send download email
export async function sendDownloadEmail(
    email: string,
    productName: string,
    downloadUrl: string,
    expiresAt: Date
): Promise<boolean> {
    // In production: Use email service (Resend, Sendgrid, etc.)
    // await resend.emails.send({
    //     from: 'noreply@cekkkirim.com',
    //     to: email,
    //     subject: `Download: ${productName}`,
    //     html: generateEmailTemplate(productName, downloadUrl, expiresAt)
    // });

    console.log(`Email sent to ${email} with download link for ${productName}`);
    return true;
}

// Format file size
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

// Format price
export function formatPrice(price: number): string {
    if (price === 0) return 'GRATIS';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price);
}
