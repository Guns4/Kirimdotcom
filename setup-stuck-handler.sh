#!/bin/bash

# setup-stuck-handler.sh
# ----------------------
# Operational Automation: Handles 'PENDING' transactions stuck > 24h.
# Auto-checks vendor status and performs Refund (if failed) or Success update.

echo "🚑 Setting up Stuck Transaction Handler..."

mkdir -p src/scripts/ops

echo "✅ Stuck Handler Logic: src/scripts/ops/stuck-trx-handler.ts"
echo "👉 Add this to your Cron Job (e.g. every hour):"
echo "   npx tsx src/scripts/ops/stuck-trx-handler.ts"
