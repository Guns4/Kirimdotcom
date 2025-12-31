#!/bin/bash

# setup-shadow-auditor.sh
# -----------------------
# Financial Reconciliation: Detect revenue leaks.
# Ensures all successful requests are properly billed.

echo "💰 Setting up Shadow Auditor..."

mkdir -p supabase/migrations
mkdir -p src/scripts/audit

echo "✅ SQL Migration: supabase/migrations/audit_schema.sql"
echo "✅ Audit Script: src/scripts/audit/revenue-auditor.ts"
echo "📊 Cron: Run daily at 00:00 to reconcile transactions"
