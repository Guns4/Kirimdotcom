#!/bin/bash

# =============================================================================
# Setup Performance Monitoring (Phase 91)
# Core Web Vitals Tracking
# =============================================================================

echo "Setting up Performance Monitoring..."
echo "================================================="
echo ""

# 1. Component
echo "1. Created Component: src/components/analytics/WebVitalsReporter.tsx"
echo "   - Hooks into Next.js useReportWebVitals"
echo "   - Sends events to 'analytics_events' (event_name: 'web_vitals')"
echo ""

# 2. Integration
echo "2. Integrated into: src/app/layout.tsx"
echo "   - <WebVitalsReporter /> runs on every page"
echo ""

# 3. Admin Widget
echo "3. Created Widget: src/components/admin/PerformanceWidget.tsx"
echo "   - Real-time dashboard for LCP, CLS, INP"
echo "   - Google standard thresholds (Green/Yellow/Red)"
echo ""

# Instructions
echo "Next Steps:"
echo "1. Browse your site to generate data"
echo "2. Check the PerformanceWidget in Admin Dashboard"
echo ""

echo "================================================="
echo "Setup Complete!"
