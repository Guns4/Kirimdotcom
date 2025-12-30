#!/bin/bash

# setup-digital-store.sh
# Passive Digital Product - Templates & Ebooks Store

echo ">>> Setting up Digital Store..."

# Components Created:
# 1. supabase/migrations/20251231_digital_store.sql
# 2. src/lib/digital-store.ts
# 3. src/components/digital/MyLibrary.tsx
# 4. src/app/dashboard/my-assets/page.tsx

echo ">>> Features:"
echo "  📄 Digital product schema"
echo "  🔐 Signed URL (24h expiry)"
echo "  📧 Email delivery on payment"
echo "  📚 'Aset Saya' library page"

echo ""
echo ">>> Product Types:"
echo "  📄 TEMPLATE - Design templates"
echo "  📚 EBOOK - Digital books"
echo "  💿 SOFTWARE - Tools & scripts"
echo "  🎓 COURSE - Video courses"
echo "  📦 OTHER - Other digital files"

echo ""
echo ">>> Delivery System:"
echo "  1. User bayar produk"
echo "  2. Status => PAID"
echo "  3. Generate signed URL (24h)"
echo "  4. Kirim email dengan link"
echo "  5. User download dari Library"

echo ""
echo ">>> Security Features:"
echo "  ✓ Signed URL dengan expiry 24 jam"
echo "  ✓ Maksimal 5x download per produk"
echo "  ✓ Token sekali pakai"
echo "  ✓ IP & user agent tracking"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
echo "Library: /dashboard/my-assets"
echo "Store: /digital-store (to be created)"
