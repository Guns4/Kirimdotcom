#!/bin/bash

# =============================================================================
# Setup Event Tracking (Phase 87)
# Quantitative Metrics for "Cek Resi" and "Premium Upgrade"
# =============================================================================

echo "Setting up Conversion Tracking..."
echo "================================================="
echo ""

# 1. Database
echo "1. Database Migration: src/utils/supabase/migrations/20241228_analytics.sql"
echo "   - Created 'analytics_events' table"
echo "   - Enabled RLS for secure insert"
echo "   -> Run this SQL in your Supabase SQL Editor!"
echo ""

# 2. Server Action
echo "2. Created Action: src/app/actions/analyticsActions.ts"
echo "   - logEvent(name, props): Server-side logging"
echo "   - getTopCouriers(): Aggregation for admin"
echo ""

# 3. Client Utility
echo "3. Created Utility: src/lib/tracking.ts"
echo "   - trackEvent(name, props): Client-side wrapper"
echo ""

# 4. Instrumentation
echo "4. Instrumented Components:"
echo "   - WidgetSearchForm.tsx -> Tracks 'click_cek_resi'"
echo "   - PricingPage.tsx -> Tracks 'view_pricing_page' & 'click_register_premium'"
echo ""

# 5. Admin Widget
echo "5. Created Widget: src/components/admin/TopCouriersWidget.tsx"
echo "   - Shows Top 5 Couriers bar chart"
echo "   -> Add <TopCouriersWidget /> to your Admin Dashboard page"
echo ""

# Instructions
echo "Next Steps:"
echo "1. Apply the Migration SQL in Supabase"
echo "2. Import TopCouriersWidget in your /admin/dashboard/page.tsx"
echo "3. Watch the data roll in!"
echo ""

echo "================================================="
echo "Setup Complete!"
