#!/bin/bash

# setup-tax-recap.sh
# Tax Compliance System (Phase 1796-1800)

echo ">>> Setting up Tax Recap System..."

# Components Created:
# 1. supabase/migrations/20251231_tax_compliance.sql
# 2. src/lib/tax-service.ts

echo ">>> Features:"
echo "  1. View: daily_sales_view"
echo "     - Aggregates SaaS, SMM, and PPOB Sales"
echo "  2. Service: generateMonthlyTaxReport()"
echo "     - Calculates 11% VAT"
echo "     - Exports to CSV format"
echo "  3. Delivery: Auto-email to finance@cekkirim.com"

echo ""
echo ">>> Integration:"
echo "  Run 'runMonthlyTaxJob()' on the 1st of every month."
echo "  (Can be triggered via API or Cron)"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
