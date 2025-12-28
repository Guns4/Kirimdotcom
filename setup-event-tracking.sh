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
echo "   -> Run this SQL in your Supabase SQL Editor!"
# (File created via tool)

# 2. Server Action
echo "2. Created Action: src/app/actions/analyticsActions.ts"
# (File created via tool)

# 3. Client Utility
echo "3. Created Utility: src/lib/tracking.ts"
# (File created via tool)

# 4. Instrumentation
echo "4. Instrumented Components:"
echo "   - WidgetSearchForm.tsx -> Tracks 'click_cek_resi'"
# (File updated via tool)

# 5. Admin Widget
echo "5. Created Widget: src/components/admin/TopCouriersWidget.tsx"
# (File created via tool)

# Instructions
echo "Next Steps:"
echo "1. Apply the Migration SQL in Supabase"
echo "2. Import TopCouriersWidget in your /admin/dashboard/page.tsx"
echo "3. Watch the data roll in!"
echo ""

echo "================================================="
echo "Setup Complete!"
