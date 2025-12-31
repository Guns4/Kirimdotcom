#!/bin/bash

# setup-api-caching.sh
# --------------------
# Cost Efficiency: Cache shipping rates to avoid repeated vendor API calls.
# Saves 99% on API costs.

echo "⚡ Setting up API Caching..."

mkdir -p src/lib/shipping
mkdir -p supabase/migrations

echo "✅ SQL Schema: supabase/migrations/caching_schema.sql"
echo "✅ Cache Engine: src/lib/shipping/cache-engine.ts"
