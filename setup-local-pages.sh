#!/bin/bash

# setup-local-pages.sh
# Hyper-Local SEO Generator

echo ">>> Setting up Local SEO Pages..."

# Validation
if [ ! -f "src/data/indonesia-regions.ts" ]; then
    echo "❌ Error: src/data/indonesia-regions.ts not found."
    exit 1
fi

echo ">>> Files already generated manually:"
echo "1. src/lib/seo-locations.ts (Data Helper)"
echo "2. src/app/area/[...slug]/page.tsx (Page Template)"

echo ">>> Running Typecheck to verify..."
npm run typecheck

echo ">>> Setup Complete!"
echo "Check: http://localhost:3000/area/jawa-barat/bandung/cicendo"
