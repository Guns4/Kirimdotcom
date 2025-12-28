#!/bin/bash

# =============================================================================
# Setup Microsoft Clarity Analytics (Phase 86)
# User Behavior Analysis with Privacy Focus
# =============================================================================

echo "Setting up Microsoft Clarity Analytics..."
echo "================================================="
echo ""

# 1. Component Creation
echo "1. Created Component: src/components/analytics/ClarityAnalytics.tsx"
echo "   - Handles cookie consent (GDPR compliance)"
echo "   - Injects Clarity script only after consent"
echo "   - Configures automatic input masking for privacy"
echo ""

# 2. Integration
echo "2. Integrated into: src/app/layout.tsx"
echo "   - Added <ClarityAnalytics /> to root layout"
echo ""

# 3. Environment Setup
echo "3. REQUIRED: Add Project ID to .env.local"
echo "   Add the following line to your .env.local file:"
echo ""
echo "   NEXT_PUBLIC_CLARITY_PROJECT_ID=your_clarity_project_id_here"
echo ""
echo "   Get this ID from: https://clarity.microsoft.com/projects"
echo ""

# 4. Usage Verification
echo "Verification Steps:"
echo "1. Clear browser cookies/storage for localhost"
echo "2. Refresh page -> Banner should appear"
echo "3. Click 'Tolak' -> No network request to clarity.ms"
echo "4. Click 'Izinkan' -> Network request to clarity.ms initiates"
echo "5. Check Clarity Dashboard after ~2 hours for data"
echo ""

echo "================================================="
echo "Setup Complete!"
