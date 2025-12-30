#!/bin/bash

# setup-sticker-gen.sh
# Final Phase: Shipping Sticker Generator

echo ">>> Setting up Sticker Generator..."

# Components Created:
# 1. src/lib/sticker-generator.ts
# 2. src/components/tools/StickerGenerator.tsx
# 3. src/app/tools/sticker-generator/page.tsx

echo ">>> Features:"
echo "  🖨️ PDF Generator (jsPDF)"
echo "  📏 A4 Layout (10 Stickers)"
echo "  🎨 Template System (Free & Premium)"
echo "  💰 Mock Payment Integration"

echo ""
echo ">>> Templates:"
echo "  1. Basic (Free) - Simple border, clean layout"
echo "  2. Premium (Rp 5.000) - Colored, Fragile icon, Custom layout"

echo ""
echo ">>> Usage:"
echo "  1. Input Nama Toko & WA"
echo "  2. Pilih Template"
echo "  3. Download PDF ready-to-print"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
echo "Tool: /tools/sticker-generator"
