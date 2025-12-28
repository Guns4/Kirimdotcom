#!/bin/bash

# =============================================================================
# Setup Funnel Dashboard (Phase 90)
# Sales Optimization & Churn Detection
# =============================================================================

echo "Setting up Funnel Dashboard..."
echo "================================================="
echo ""

# 1. Backend Logic
echo "1. Created Action: src/app/actions/funnelActions.ts"
echo "   - getFunnelStats(): Aggregates (Visitor -> Registered -> Paid)"
echo ""

# 2. Tracking
echo "2. Instrumented Tracking:"
echo "   - Register Page: 'view_register_page', 'complete_registration'"
echo "   - Payment: 'complete_purchase' (in Payment Webhook)"
echo ""

# 3. Admin Widget
echo "3. Created Widget: src/components/admin/FunnelAnalysisWidget.tsx"
echo "   - Visualizes drop-off rates"
echo "   - Shows total conversion %"
echo ""

# Instructions
echo "Next Steps:"
echo "1. Add <FunnelAnalysisWidget /> to your Admin Dashboard"
echo "2. Watch as users move through the funnel!"
echo ""

echo "================================================="
echo "Setup Complete!"
