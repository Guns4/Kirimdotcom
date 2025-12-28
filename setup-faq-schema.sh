#!/bin/bash

# =============================================================================
# Setup FAQ Schema (Phase 110)
# Rich Snippets & SEO Visibility
# =============================================================================

echo "Setting up FAQ Schema..."
echo "================================================="
echo ""

# 1. Data Source
echo "1. Creating Data Source: src/data/general-faq.json"
# (File created via tool)

# 2. Component
echo "2. Creating Component: src/components/seo/FAQJsonLd.tsx"
# (File created via tool)

# Instructions
echo "Next Steps:"
echo "1. Open your page file (e.g., src/app/page.tsx or src/app/faq/page.tsx)."
echo "2. Import the component: import FAQJsonLd from '@/components/seo/FAQJsonLd';"
echo "3. Add <FAQJsonLd /> anywhere in the return JSX (it renders invisible script tags)."
echo ""

echo "================================================="
echo "Setup Complete!"
