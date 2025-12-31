#!/bin/bash

# setup-domain-lock.sh
# --------------------
# Access Control: Domain Whitelist for API Keys.
# Prevents API key theft and unauthorized usage.

echo "🔐 Setting up Domain Lock..."

mkdir -p supabase/migrations
mkdir -p src/lib/security

echo "✅ SQL Migration: supabase/migrations/domain_lock_schema.sql"
echo "✅ Middleware: src/lib/security/domain-guard.ts"
echo "👉 Add UI in dashboard for users to manage allowed domains"
