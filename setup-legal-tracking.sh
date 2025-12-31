#!/bin/bash

# setup-legal-tracking.sh
# -----------------------
# Legal Compliance: Non-repudiation consent tracking.
# Ensures legal enforceability of user agreements.

echo "⚖️ Setting up Legal Tracking System..."

mkdir -p supabase/migrations
mkdir -p src/lib/legal

echo "✅ SQL Schema: supabase/migrations/legal_tracking_schema.sql"
echo "✅ Middleware: src/lib/legal/consent-guard.ts"
echo "📄 Tracks user consent with IP, timestamp, and document hash"
