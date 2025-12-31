#!/bin/bash

# setup-freemium-quota.sh
# -----------------------
# User Acquisition: Free Tier (100 requests/month).
# Helps onboard new users without upfront deposit.

echo "🎁 Setting up Freemium Quota..."

mkdir -p supabase/migrations

echo "✅ SQL Schema: supabase/migrations/freemium_schema.sql"
echo "👉 Update: src/lib/billing/metering.ts to check free quota."
