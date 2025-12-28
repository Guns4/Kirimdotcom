#!/bin/bash

# =============================================================================
# Setup Client Feature Flags (Phase 107)
# React Hook & Context Provider
# =============================================================================

echo "Setting up Client-Side Feature Flags..."
echo "================================================="
echo ""

# 1. Server Action (to fetch all public flags)
echo "1. Creating Fetch Action: src/app/actions/flagActions.ts"
# (File created via tool)

# 2. Context Provider
echo "2. Creating Provider: src/components/providers/FeatureFlagProvider.tsx"
mkdir -p src/components/providers
# (File created via tool)

# 3. Root Integration Info
echo "3. Integration Instructions"
echo "You need to wrap your app in 'src/app/layout.tsx':"
echo ""
echo "import { getPublicFlags } from '@/app/actions/flagActions';"
echo "import { FeatureFlagProvider } from '@/components/providers/FeatureFlagProvider';"
echo ""
echo "// inside RootLayout component:"
echo "const flags = await getPublicFlags();"
echo ""
echo "// inside return:"
echo "<FeatureFlagProvider initialFlags={flags}>"
echo "   {children}"
echo "</FeatureFlagProvider>"
echo ""

echo "================================================="
echo "Setup Complete!"
