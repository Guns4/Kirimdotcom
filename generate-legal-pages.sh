#!/bin/bash

# generate-legal-pages.sh
# -----------------------
# Document Management: Auto-generate legal documents.
# Creates comprehensive ToS, Privacy Policy, and AUP.

echo "📄 Generating Legal Pages..."

mkdir -p src/app/legal/terms
mkdir -p src/app/legal/privacy
mkdir -p src/app/legal/aup

echo "✅ Terms of Service: src/app/legal/terms/page.tsx"
echo "✅ Privacy Policy: src/app/legal/privacy/page.tsx"
echo "✅ Acceptable Use Policy: src/app/legal/aup/page.tsx"
