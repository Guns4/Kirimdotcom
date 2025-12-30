#!/bin/bash

# setup-balance-guard.sh
# Financial Safety System (Phase 1786-1790)

echo ">>> Setting up Balance Guard..."

# Components Created:
# 1. supabase/migrations/20251231_balance_guard.sql
# 2. src/lib/balance-guard.ts

echo ">>> Features:"
echo "  1. DB Trigger: 'on_balance_update'"
echo "     - Checks IF new.balance < 0"
echo "     - Logs to 'financial_incidents'"
echo "     - (Intended Action) UPDATE status = 'FROZEN'"
echo ""
echo "  2. Alert System:"
echo "     - Sends CRITICAL Telegram Alert"
echo "     - Logs incident details"

echo ""
echo ">>> Integration:"
echo "  Ensure 'wallets' table exists and is used for transactions."
echo "  Triggers are automatic on database level."

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
