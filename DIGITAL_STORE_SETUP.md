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
