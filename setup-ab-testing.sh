#!/bin/bash

# =============================================================================
# Setup A/B Testing Framework (Phase 88)
# Conversion Rate Optimization
# =============================================================================

echo "Setting up A/B Testing Framework..."
echo "================================================="
echo ""

# 1. Utility
echo "1. Created Utility: src/lib/ab-testing.ts"
echo "   - getVariant(): Deterministic hashing for stable user assignment"
echo "   - useExperiment(): React hook for easy implementation"
echo "   - Integrates with Analytics to log 'experiment_exposure'"
echo ""

# 2. Experiment
echo "2. Implemented Experiment: Pricing CTA Text"
echo "   - File: src/app/pricing/page.tsx"
echo "   - Experiment ID: 'pricing_cta_text_v1'"
echo "   - Variants:"
echo "     A) 'original' -> 'Upgrade via WA'"
echo "     B) 'action_focused' -> 'Mulai Sekarang'"
echo ""

# 3. Analytics
echo "3. Data Tracking:"
echo "   - User variants are stored in local storage ('ab-user-id')"
echo "   - Exposure events are logged to Supabase 'analytics_events'"
echo ""

# Usage
echo "Usage Example:"
echo "----------------------------------------"
echo "const variant = useExperiment('my_experiment_id', ['control', 'variant_b']);"
echo "if (variant === 'variant_b') { ... }"
echo "----------------------------------------"

echo ""
echo "================================================="
echo "Setup Complete!"
