#!/bin/bash

# setup-social-store.sh
# Service Marketplace - Buy followers like pulsa

echo ">>> Setting up Social Store..."

# Components Created:
# 1. src/lib/social-store.ts
# 2. src/components/smm/SocialStorefront.tsx
# 3. src/components/smm/SocialOrderHistory.tsx
# 4. src/app/social-store/page.tsx

echo ">>> Features:"
echo "  🛒 Product grid UI (like pulsa store)"
echo "  💳 Pay with balance"
echo "  📊 Order status tracking"
echo "  🔄 Auto status sync from provider"

echo ""
echo ">>> Products Available:"
echo "  📸 Instagram"
echo "     - 1K Followers = Rp 15.000"
echo "     - 5K Followers = Rp 65.000"
echo "     - 500 Likes = Rp 5.000"
echo "     - 1K Likes = Rp 8.000"
echo ""
echo "  🎵 TikTok"
echo "     - 1K Followers = Rp 20.000"
echo "     - 500 Likes = Rp 4.000"
echo "     - 10K Views = Rp 10.000"
echo ""
echo "  ▶️ YouTube"
echo "     - 100 Subs = Rp 25.000"
echo "     - 1K Views = Rp 8.000"
echo ""
echo "  ⭐ Google Reviews"
echo "     - 5 Reviews = Rp 100.000"
echo "     - 10 Reviews = Rp 180.000"

echo ""
echo ">>> Order Flow:"
echo "  1. Pilih produk"
echo "  2. Input link profile/post"
echo "  3. Bayar pakai saldo"
echo "  4. Order dikirim ke provider"
echo "  5. Status update otomatis"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
echo "Social Store: http://localhost:3000/social-store"
