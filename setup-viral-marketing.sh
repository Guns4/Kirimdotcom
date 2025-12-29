#!/bin/bash

# =============================================================================
# Viral Marketing Setup Script
# Instagram/WA Story-ready shareable tracking receipt
# =============================================================================

echo "📱 Setting up Viral Marketing Feature"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}✓${NC} ShareableCard component created"
echo ""

# =============================================================================
# Component Features
# =============================================================================
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
# Installation
# =============================================================================
echo ""
echo -e "${BLUE}📦 Dependencies:${NC}"
echo "  Run: npm install html2canvas"

# =============================================================================
# Usage Example
# =============================================================================
echo ""
echo -e "${BLUE}💡 Usage:${NC}"
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
# Brand Gradient Reference
# =============================================================================
echo ""
echo -e "${BLUE}🎨 Brand Gradients:${NC}"
echo "  • Delivered: from-green-500 to-emerald-600"
echo "  • In Transit: from-blue-500 to-indigo-600"
echo "  • Default: from-indigo-500 to-purple-600"

# =============================================================================
# Share Capabilities
# =============================================================================
echo ""
echo -e "${BLUE}🔗 Share Capabilities:${NC}"
echo "  • Desktop: Download as PNG"
echo "  • Mobile (modern): Web Share API (native)"
echo "  • Fallback: WhatsApp Web link"

# =============================================================================
# Social Media Best Practices
# =============================================================================
echo ""
echo -e "${BLUE}📸 Social Media Optimization:${NC}"
echo "  • Aspect Ratio: 9:16 (Instagram/WA Story)"
echo "  • Resolution: 2x scale (1080x1920px)"
echo "  • Format: PNG (transparency support)"
echo "  • File naming: cekkirim-[tracking].png"

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "================================"
echo -e "${GREEN}✅ Viral Marketing Setup Complete!${NC}"
echo "================================"
echo ""
echo "🚀 Ready to go viral on Instagram & WhatsApp!"
echo "📱 Users can now share beautiful tracking receipts"
echo "📈 Free marketing through user-generated content"
echo ""
echo "Next Steps:"
echo "1. npm install html2canvas"
echo "2. Integrate ShareableCard into tracking results page"
echo "3. Add tracking state (delivered/transit) detection"
echo "4. Test on mobile devices for Share API"
echo "5. Monitor social shares analytics"
echo ""
