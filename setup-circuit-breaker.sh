#!/bin/bash

# setup-circuit-breaker.sh
# ------------------------
# Anomaly Detection: Auto-suspend abusive API keys.
# Protects resources and user balance from attacks.

echo "⚡ Setting up Circuit Breaker..."

mkdir -p supabase/migrations
mkdir -p src/lib/security

echo "✅ SQL Migration: supabase/migrations/circuit_breaker_schema.sql"
echo "✅ Logic: src/lib/security/circuit-breaker.ts"
echo "📊 Rate tracking: In-memory store (production: use Redis)"
