#!/bin/bash

# setup-route-optimizer.sh
# B2B Intelligence - Route Optimization for Bulk Shipping

echo ">>> Setting up Route Optimizer..."

# Components Created:
# 1. supabase/migrations/20251231_route_optimizer.sql
# 2. src/lib/route-optimizer.ts
# 3. src/app/api/optimize-route/route.ts
# 4. src/components/business/RouteOptimizer.tsx
# 5. src/app/business/route-optimizer/page.tsx

echo ">>> Checking database migration..."
if [ -f "supabase/migrations/20251231_route_optimizer.sql" ]; then
    echo "✓ Migration file ready"
    echo "  Run this in Supabase SQL Editor to create route_optimizations table"
fi

echo ""
echo ">>> Feature Overview:"
echo "  - Upload CSV with bulk shipment data"
echo "  - Algorithm compares 5+ couriers per package"
echo "  - Optimization criteria: CHEAPEST, FASTEST, or BALANCED"
echo "  - Savings report: Single courier vs Mix strategy"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
echo "Route Optimizer live at: http://localhost:3000/business/route-optimizer"
echo ""
echo ">>> Next Steps:"
echo "1. Run migration in Supabase SQL Editor"
echo "2. Test with sample CSV (template auto-generated in app)"
echo "3. For production: Replace mock pricing with real courier APIs"
