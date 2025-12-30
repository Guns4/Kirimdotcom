#!/bin/bash

# setup-saas-billing.sh
# SaaS Billing & Recurring Revenue (Phase 1776-1780)

echo ">>> Setting up SaaS Billing System..."

# Components Created:
# 1. supabase/migrations/20251231_saas_billing.sql
# 2. src/lib/billing-service.ts

echo ">>> Features:"
echo "  1. Plans: BASIC (150k), PRO (500k), ENTERPRISE (2jt)"
echo "  2. Expiry Guard: checkSubscriptionStatus()"
echo "  3. Auto-Invoicing: H-7 Reminder & Invoice Generation"
echo "  4. Redirect: Expired tenants sent to /renew-subscription"

echo ""
echo ">>> Integration (Middleware usage):"
echo "  import { checkSubscriptionStatus } from '@/lib/billing-service';"
echo "  const status = await checkSubscriptionStatus(tenantId);"
echo "  if (!status.isActive) return NextResponse.redirect(new URL(status.redirectUrl));"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
