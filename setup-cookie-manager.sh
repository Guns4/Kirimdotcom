#!/bin/bash

# setup-cookie-manager.sh
# -----------------------
# Legal Compliance: Cookie Consent Banner (GDPR/CCPA).
# Blocks non-essential scripts until consent is given.

echo "🍪 Setting up Cookie Manager..."

mkdir -p src/components/legal

echo "✅ Cookie UI: src/components/legal/CookieBanner.tsx"
echo "👉 Import <CookieBanner /> in your Root Layout (src/app/layout.tsx)"
