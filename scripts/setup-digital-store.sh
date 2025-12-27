#!/bin/bash

# Setup Digital Product Sales Module (Phase 301-305)
echo "🚀 Setting up Digital Store..."

# 1. Create Database Migration
echo "🗄️ Creating Database Migration..."
mkdir -p src/utils/supabase/migrations
cat << 'EOF' > src/utils/supabase/migrations/20241227_digital_store.sql
-- Digital Products Table
CREATE TABLE IF NOT EXISTS digital_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    file_url TEXT NOT NULL, -- Supabase Storage path (private bucket)
    file_size INTEGER, -- in bytes
    category TEXT, -- 'ebook', 'template', 'design', 'software'
    preview_image TEXT,
    download_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Purchases Table
CREATE TABLE IF NOT EXISTS user_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES digital_products(id) ON DELETE CASCADE,
    purchase_price NUMERIC NOT NULL,
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    payment_method TEXT, -- 'simulate', 'stripe', 'midtrans', etc
    transaction_id TEXT UNIQUE,
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMPTZ,
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id) -- Prevent duplicate purchases
);

-- Download Log Table (for analytics)
CREATE TABLE IF NOT EXISTS product_downloads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_id UUID REFERENCES user_purchases(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES digital_products(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_digital_products_category ON digital_products(category);
CREATE INDEX IF NOT EXISTS idx_digital_products_active ON digital_products(is_active);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_status ON user_purchases(payment_status);

-- RLS Policies
ALTER TABLE digital_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_downloads ENABLE ROW LEVEL SECURITY;

-- Anyone can view active products
CREATE POLICY "Public read active products" ON digital_products 
    FOR SELECT USING (is_active = true);

-- Only product owners can update their products
CREATE POLICY "Owners manage products" ON digital_products 
    FOR ALL USING (auth.uid() = created_by);

-- Users can view their own purchases
CREATE POLICY "Users view own purchases" ON user_purchases 
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create purchases
CREATE POLICY "Users create purchases" ON user_purchases 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their download history
CREATE POLICY "Users view own downloads" ON product_downloads 
    FOR SELECT USING (auth.uid() = user_id);

-- Seed Sample Digital Products
INSERT INTO digital_products (title, description, price, file_url, category, preview_image) VALUES
('E-book: Panduan Lengkap Logistik Indonesia', 
 'Panduan komprehensif tentang sistem logistik di Indonesia untuk UMKM', 
 99000, 
 'private/ebooks/panduan-logistik-indonesia.pdf',
 'ebook',
 '/images/products/ebook-logistik.jpg'),

('Template Excel: Laporan Keuangan UMKM',
 'Template laporan keuangan lengkap dengan rumus otomatis',
 49000,
 'private/templates/laporan-keuangan-umkm.xlsx',
 'template',
 '/images/products/template-keuangan.jpg'),

('Template Canva: Social Media Kit Bisnis Online',
 'Paket lengkap 30 template Canva untuk promosi bisnis online',
 79000,
 'private/designs/social-media-kit.zip',
 'design',
 '/images/products/social-media-kit.jpg'),

('Checklist Operasional Gudang',
 'Checklist lengkap untuk manajemen gudang dan inventory',
 29000,
 'private/templates/checklist-gudang.pdf',
 'template',
 '/images/products/checklist-gudang.jpg')
ON CONFLICT DO NOTHING;

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE digital_products 
    SET download_count = download_count + 1 
    WHERE id = NEW.product_id;
    
    UPDATE user_purchases 
    SET download_count = download_count + 1,
        last_downloaded_at = NOW()
    WHERE id = NEW.purchase_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_download_count
AFTER INSERT ON product_downloads
FOR EACH ROW
EXECUTE FUNCTION increment_download_count();
EOF

# 2. Create Server Actions
echo "⚡ Creating Server Actions..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/digital-store.ts
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
EOF

# 3. Create Shop Page
echo "🎨 Creating Shop Page..."
mkdir -p src/app/shop
cat << 'EOF' > src/app/shop/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { getDigitalProducts, purchaseProduct, checkUserPurchase } from '@/app/actions/digital-store'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Download, FileText, FileSpreadsheet, Palette, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function DigitalShopPage() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        setLoading(true)
        const result = await getDigitalProducts()
        if (result?.data) {
            setProducts(result.data)
            
            // Check purchase status for each product
            const purchased = new Set<string>()
            for (const product of result.data) {
                const checkResult = await checkUserPurchase(product.id)
                if (checkResult?.data?.purchased) {
                    purchased.add(product.id)
                }
            }
            setPurchasedIds(purchased)
        }
        setLoading(false)
    }

    const handlePurchase = async (productId: string, productTitle: string) => {
        try {
            const result = await purchaseProduct(productId)
            if (result?.data?.success) {
                toast.success(`Successfully purchased: ${productTitle}`)
                setPurchasedIds(prev => new Set(prev).add(productId))
            }
        } catch (error: any) {
            toast.error(error.message || 'Purchase failed')
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'ebook': return <FileText className="w-5 h-5" />
            case 'template': return <FileSpreadsheet className="w-5 h-5" />
            case 'design': return <Palette className="w-5 h-5" />
            default: return <FileText className="w-5 h-5" />
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price)
    }

    if (loading) {
        return (
            <div className="container-custom py-8">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container-custom py-8 space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-2xl">
                <h1 className="text-4xl font-bold flex items-center gap-3">
                    <ShoppingCart className="w-10 h-10" />
                    Digital Store
                </h1>
                <p className="mt-2 text-indigo-100">
                    E-books, Templates, dan Desain untuk UMKM
                </p>
            </div>

            {/* Quick Link to Purchases */}
            <div className="flex justify-end">
                <Link href="/shop/my-purchases">
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        My Purchases
                    </Button>
                </Link>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => {
                    const isPurchased = purchasedIds.has(product.id)
                    
                    return (
                        <Card key={product.id} className="hover:shadow-lg transition-all">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        {getCategoryIcon(product.category)}
                                        <Badge variant="outline" className="capitalize">
                                            {product.category}
                                        </Badge>
                                    </div>
                                    {isPurchased && (
                                        <Badge className="bg-green-500">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Owned
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="mt-3">{product.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 line-clamp-3">
                                    {product.description}
                                </p>
                                <div className="mt-4">
                                    <p className="text-2xl font-bold text-indigo-600">
                                        {formatPrice(product.price)}
                                    </p>
                                    {product.download_count > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {product.download_count} downloads
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter>
                                {isPurchased ? (
                                    <Link href={`/shop/download/${product.id}`} className="w-full">
                                        <Button className="w-full gap-2 bg-green-600 hover:bg-green-700">
                                            <Download className="w-4 h-4" />
                                            Download Now
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button 
                                        onClick={() => handlePurchase(product.id, product.title)}
                                        className="w-full gap-2"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        Buy Now
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>

            {products.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No products available at the moment</p>
                </div>
            )}
        </div>
    )
}
EOF

# 4. Create My Purchases Page
echo "📦 Creating My Purchases Page..."
cat << 'EOF' > src/app/shop/my-purchases/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { getUserPurchases } from '@/app/actions/digital-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Package, Calendar } from 'lucide-react'
import Link from 'link'

export default function MyPurchasesPage() {
    const [purchases, setPurchases] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPurchases()
    }, [])

    const loadPurchases = async () => {
        setLoading(true)
        const result = await getUserPurchases()
        if (result?.data) {
            setPurchases(result.data)
        }
        setLoading(false)
    }

    if (loading) {
        return <div className="container-custom py-8">Loading...</div>
    }

    return (
        <div className="container-custom py-8 space-y-6">
            <h1 className="text-3xl font-bold flex items-center gap-3">
                <Package className="w-8 h-8" />
                My Purchases
            </h1>

            {purchases.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                        <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>You haven't purchased any digital products yet</p>
                        <Link href="/shop">
                            <Button className="mt-4">Browse Store</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {purchases.map(purchase => (
                        <Card key={purchase.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle>{purchase.digital_products.title}</CardTitle>
                                    <Badge className="bg-green-500">Paid</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    Purchased: {new Date(purchase.purchased_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Download className="w-4 h-4" />
                                    Downloaded: {purchase.download_count} times
                                </div>
                                <Link href={`/shop/download/${purchase.product_id}`}>
                                    <Button className="gap-2">
                                        <Download className="w-4 h-4" />
                                        Download Again
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
EOF

# 5. Create Secure Download Page
echo "🔒 Creating Secure Download Page..."
mkdir -p src/app/shop/download/[id]
cat << 'EOF' > src/app/shop/download/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSecureDownloadUrl } from '@/app/actions/digital-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Lock, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function SecureDownloadPage() {
    const params = useParams()
    const router = useRouter()
    const productId = params.id as string

    const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
    const [product, setProduct] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [expiresIn, setExpiresIn] = useState<number>(0)

    useEffect(() => {
        generateDownloadLink()
    }, [productId])

    const generateDownloadLink = async () => {
        setLoading(true)
        try {
            const result = await getSecureDownloadUrl(productId)
            if (result?.data) {
                setDownloadUrl(result.data.downloadUrl)
                setProduct(result.data.product)
                setExpiresIn(result.data.expiresIn)
                toast.success('Download link generated!')
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate download link')
            setTimeout(() => router.push('/shop'), 2000)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="container-custom py-12 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-600">Generating secure download link...</p>
            </div>
        )
    }

    return (
        <div className="container-custom py-8 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="w-6 h-6 text-green-600" />
                        Secure Download
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {product && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-bold text-lg">{product.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Purchase verified</span>
                        </div>
                        <div className="flex items-center gap-2 text-orange-600">
                            <Clock className="w-5 h-5" />
                            <span className="text-sm">Link expires in {Math.floor(expiresIn / 60)} minutes</span>
                        </div>
                    </div>

                    {downloadUrl && (
                        <a href={downloadUrl} download>
                            <Button className="w-full gap-2 text-lg py-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                                <Download className="w-6 h-6" />
                                Download Now
                            </Button>
                        </a>
                    )}

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                        <p className="font-medium mb-2">🔒 Secure Download Notes:</p>
                        <ul className="list-disc ml-5 space-y-1">
                            <li>This link is unique and expires in 1 hour</li>
                            <li>You can re-download anytime from "My Purchases"</li>
                            <li>Do not share this link with others</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
EOF

# 6. Create Storage Bucket Instructions
echo "📝 Creating Setup Instructions..."
cat << 'EOF' > DIGITAL_STORE_SETUP.md
# Digital Store Setup Instructions

## 1. Database Setup

Run the migration file in your Supabase SQL Editor:
```sql
-- Execute: src/utils/supabase/migrations/20241227_digital_store.sql
```

## 2. Supabase Storage Setup

### Create Private Storage Bucket:

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named: `digital-products`
3. **IMPORTANT**: Make it PRIVATE (not public)
4. Upload your digital files to this bucket with folder structure:
   ```
   digital-products/
   ├── private/
   │   ├── ebooks/
   │   │   └── panduan-logistik-indonesia.pdf
   │   ├── templates/
   │   │   ├── laporan-keuangan-umkm.xlsx
   │   │   └── checklist-gudang.pdf
   │   └── designs/
   │       └── social-media-kit.zip
   ```

### Storage RLS Policies:

```sql
-- Only authenticated users with valid purchases can access files
CREATE POLICY "Allow authenticated downloads"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'digital-products' 
    AND EXISTS (
        SELECT 1 FROM user_purchases up
        JOIN digital_products dp ON up.product_id = dp.id
        WHERE up.user_id = auth.uid()
        AND up.payment_status = 'paid'
        AND dp.file_url = storage.objects.name
    )
);
```

## 3. Environment Variables

No additional environment variables needed for basic setup.
For production payment integration, add:

```env
# In .env.local
STRIPE_SECRET_KEY=your_stripe_key (for real payments)
MIDTRANS_SERVER_KEY=your_midtrans_key (for Indonesian payments)
```

## 4. Routes Created

- `/shop` - Browse all digital products
- `/shop/my-purchases` - View user's purchased products
- `/shop/download/[id]` - Secure download page with time-limited URL

## 5. Features Implemented

✅ Digital product catalog
✅ Simulated purchase system (auto-set to 'paid')
✅ Secure file downloads (private Supabase storage)
✅ Purchase verification before download
✅ Download tracking and analytics
✅ Time-limited download URLs (1 hour expiry)
✅ Prevent duplicate purchases
✅ Download history

## 6. Next Steps (Production)

1. **Integrate Real Payment Gateway:**
   - Replace simulated payment with Stripe/Midtrans
   - Add webhook listeners for payment confirmation
   - Update `payment_status` based on webhook events

2. **Add Product Management:**
   - Admin panel to add/edit/delete products
   - File upload interface
   - Pricing management

3. **Enhanced Security:**
   - Rate limiting on downloads
   - Watermarking for PDFs
   - DRM for sensitive content

4. **Analytics:**
   - Sales dashboard
   - Popular products tracking
   - Revenue reports

## 7. Testing

Test the flow:
1. Visit `/shop`
2. Click "Buy Now" on any product (simulated payment - instant success)
3. Click "Download Now" or go to "My Purchases"
4. Secure download link generated from private storage
5. File downloads successfully

## Security Features

- ✅ Files stored in PRIVATE bucket (not accessible via public URL)
- ✅ Download URLs are signed and expire in 1 hour
- ✅ Purchase verification required before download
- ✅ User can only download their own purchased products
- ✅ Download activity logged for auditing
EOF

echo "✅ Digital Store Setup Complete!"
echo "📚 Next steps:"
echo "   1. Run migration: src/utils/supabase/migrations/20241227_digital_store.sql"
echo "   2. Create Supabase Storage bucket: 'digital-products' (PRIVATE)"
echo "   3. Upload sample files to the bucket"
echo "   4. Visit /shop to test the store"
echo ""
echo "📖 See DIGITAL_STORE_SETUP.md for detailed instructions"
