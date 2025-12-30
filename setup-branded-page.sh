#!/bin/bash

# setup-branded-page.sh
# Branding Service - Custom themed tracking pages

echo ">>> Setting up Branded Page System..."

# Components Created:
# 1. supabase/migrations/20251231_shop_branding.sql
# 2. src/lib/shop-branding.ts
# 3. src/components/branding/ThemeEditor.tsx
# 4. src/components/branding/BrandedTrackingPage.tsx

echo ">>> Features:"
echo "  🎨 Theme Editor (Logo, Banner, Colors)"
echo "  🔗 Dynamic /track?shop_id=xxx"
echo "  💰 Branding Pro subscription lock"

echo ""
echo ">>> Theme Editor Options:"
echo "  📷 Logo Upload (max 2MB)"
echo "  🖼️  Banner Iklan (max 5MB)"  
echo "  🎨 5 Custom Colors:"
echo "     - Primary Color"
echo "     - Secondary Color"
echo "     - Accent Color"
echo "     - Background Color"
echo "     - Text Color"

echo ""
echo ">>> Subscription Pricing:"
echo "  Branding Pro Monthly: Rp 20.000"
echo "  Branding Pro Yearly: Rp 200.000 (2 bulan gratis)"

echo ""
echo ">>> Features Unlocked with Branding Pro:"
echo "  ✓ Custom Logo"
echo "  ✓ Custom Colors"
echo "  ✓ Banner Iklan Sendiri"
echo "  ✓ Remove 'Powered by CekKirim'"
echo "  ✓ Custom Footer Text"

echo ""
echo ">>> Usage:"
echo "  1. Seller setup branding di dashboard"
echo "  2. Share link: cekkkirim.com/track?shop_id=tokosaya"
echo "  3. Customer lihat halaman dengan branding seller"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
echo "Theme Editor: /dashboard/branding"
echo "Branded Track: /track?shop_id=xxx"
