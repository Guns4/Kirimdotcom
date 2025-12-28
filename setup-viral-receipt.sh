#!/bin/bash

# =============================================================================
# Viral Marketing Setup Script
# Instagram/WA Story-ready shareable tracking receipt
# =============================================================================

echo "🚀 Setting up Viral Marketing Feature"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# 1. Install Dependencies
# =============================================================================
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm list html2canvas > /dev/null 2>&1
if [ $? -ne 0 ]; then
    npm install html2canvas
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅${NC} html2canvas installed"
    else
        echo "Failed to install html2canvas"
        exit 1
    fi
else
    echo -e "${GREEN}✅${NC} html2canvas already installed"
fi

# =============================================================================
# 2. Files Created
# =============================================================================
echo ""
echo -e "${BLUE}📂 Files created:${NC}"
echo "  • src/components/ShareableCard.tsx"
echo "  • setup-viral-receipt.sh"

# =============================================================================
# 3. Component Features
# =============================================================================
echo ""
echo -e "${BLUE}✨ ShareableCard Features:${NC}"
echo "  • Instagram Story (9:16 aspect ratio)"
echo "  • Brand gradient background"
echo "  • Status emoji (✅ Delivered, 🚚 Transit)"
echo "  • Courier badge"
echo "  • Delivery time display"
echo "  • Tracking number watermark"
echo "  • One-click download (PNG)"
echo "  • WhatsApp share integration"

# =============================================================================
# 4. Usage Example
# =============================================================================
echo ""
echo -e "${BLUE}💻 Usage:${NC}"
cat << 'EOF'

import { ShareableCard } from '@/components/ShareableCard';

export default function TrackingPage() {
  return (
    <ShareableCard
      trackingNumber="JNE123456789"
      courier="JNE"
      status="DELIVERED"
      deliveryDays={2}
      origin="Jakarta"
      destination="Bandung"
    />
  );
}

EOF

# =============================================================================
# 5. Brand Gradient Reference
# =============================================================================
echo ""
echo -e "${BLUE}🎨 Brand Gradients:${NC}"
echo "  • Delivered: from-green-500 to-emerald-600"
echo "  • In Transit: from-blue-500 to-indigo-600"
echo "  • Default: from-primary-500 to-accent-500"

# =============================================================================
# 6. Mobile Share API
# =============================================================================
echo ""
echo -e "${BLUE}📱 Share Capabilities:${NC}"
echo "  • Desktop: Download as PNG"
echo "  • Mobile (modern): Web Share API (native)"
echo "  • Fallback: WhatsApp Web link"

# =============================================================================
# 7. Social Media Best Practices
# =============================================================================
echo ""
echo -e "${BLUE}📈 Social Media Optimization:${NC}"
echo "  • Aspect Ratio: 9:16 (Instagram/WA Story)"
echo "  • Resolution: 2x scale (1080x1920px)"
echo "  • Format: PNG (transparency support)"
echo "  • File naming: cekkirim-[tracking].png"

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "================================"
echo -e "${GREEN}🎉 Viral Marketing Setup Complete!${NC}"
echo "================================"
echo ""
echo "🚀 Ready to go viral on Instagram & WhatsApp!"
echo "👥 Users can now share beautiful tracking receipts"
echo "💰 Free marketing through user-generated content"
echo ""
echo "Next Steps:"
echo "1. Integrate ShareableCard into tracking results page"
echo "2. Add tracking state (delivered/transit) detection"
echo "3. Test on mobile devices for Share API"
echo "4. Monitor social shares analytics"
echo ""

exit 0
