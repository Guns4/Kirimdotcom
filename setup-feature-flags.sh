#!/bin/bash

# =============================================================================
# Setup Feature Flags (Phase 93)
# Safer Rollouts & Beta Testing
# =============================================================================

echo "Setting up Feature Flags..."
echo "================================================="
echo ""

# 1. Database Schema
echo "1. Database Schema: feature_flags_schema.sql"
echo "   - Please run this SQL in Supabase SQL Editor"

# 2. Util
echo "2. Created Utility: src/lib/feature-flags.ts"
# (File created via tool)

# 3. Components
echo "3. Created Components:"
echo "   - src/components/auth/FeatureGate.tsx: Wrapper for conditional UI"
echo "   - src/components/admin/FeatureManager.tsx: Admin widget"
# (Files created via tool)

# Instructions
echo "Next Steps:"
echo "1. Run 'feature_flags_schema.sql' in Supabase"
echo "2. Add <FeatureManager /> to your Admin Dashboard"
echo "3. Wrap experimental features with <FeatureGate featureKey='my_key'>...</FeatureGate>"
echo ""

echo "================================================="
echo "Setup Complete!"
