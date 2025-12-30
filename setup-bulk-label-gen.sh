#!/bin/bash

# setup-bulk-label-gen.sh
# Operational Efficiency - Bulk Label Generation

echo ">>> Setting up Bulk Label Generator..."

# Components Created:
# 1. supabase/migrations/20251231_bulk_labels.sql
# 2. src/lib/bulk-label-generator.ts
# 3. src/components/business/BulkLabelGenerator.tsx
# 4. Updated: src/components/business/RouteOptimizer.tsx (integration)

echo ">>> Feature Overview:"
echo "  - Generate single PDF with hundreds of labels"
echo "  - Labels automatically sorted by courier (e.g., JNE pages 1-50, SiCepat 51-80)"
echo "  - Separate handover manifest per courier"
echo "  - Warehouse-friendly workflow"

echo ""
echo ">>> Checking Dependencies..."
if npm list jspdf jspdf-autotable jsbarcode | grep -q "jspdf"; then
    echo "✓ jsPDF and dependencies installed"
else
    echo "Installing PDF dependencies..."
    npm install jspdf jspdf-autotable jsbarcode
fi

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
echo "Bulk Label Generator integrated at: /business/route-optimizer"
echo ""
echo ">>> Workflow:"
echo "1. Run route optimization"
echo "2. Click 'Generate Labels & Manifests'"
echo "3. Download bulk labels PDF (sorted by courier)"
echo "4. Download manifest documents for each courier"
echo "5. Print and distribute to warehouse staff"
