#!/bin/bash

# setup-bio-link.sh
# Marketing Tool - Linktree-style Bio Link for Sellers

echo ">>> Setting up Bio Link Generator..."

# Components Created:
# 1. supabase/migrations/20251231_bio_links.sql
# 2. src/lib/bio-link.ts
# 3. src/components/bio/BioPageView.tsx
# 4. src/app/bio/[username]/page.tsx

mkdir -p src/lib
mkdir -p src/components/bio
mkdir -p src/app/bio/[username]
mkdir -p supabase/migrations

echo ">>> Features:"
echo "  📱 Linktree-style bio page"
echo "  📦 Integrated Resi Tracker"
echo "  💬 WhatsApp Button"
echo "  🛍️  Product Grid"
echo "  📊 Analytics (views, clicks)"

echo ""
echo ">>> Bio Page Modules:"
echo "  1. Profile (Avatar, Name, Bio)"
echo "  2. Resi Tracker (Filtered by seller's couriers)"
echo "  3. WhatsApp Button"
echo "  4. Custom Links (Shopee, Tokopedia, etc.)"
echo "  5. Product Grid"

echo ""
echo ">>> Analytics Tracked:"
echo "  - Page Views"
echo "  - Link Clicks"
echo "  - WA Button Clicks"
echo "  - Resi Checks"
echo "  - Referrer Sources"

echo ""
echo ">>> Courier Filter:"
echo "  📦 JNE"
echo "  🚚 J&T Express"
echo "  ⚡ SiCepat"
echo "  🛵 AnterAja"
echo "  🥷 Ninja Van"
echo "  📮 POS Indonesia"

echo ""
echo ">>> Usage:"
echo "  1. Seller setup bio page di dashboard"
echo "  2. Share link: cekkkirim.com/bio/username"
echo "  3. Customer klik link, cek resi, chat WA"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
echo "Bio Page: /bio/[username]"
echo "Editor: /dashboard/bio (to be created)"
