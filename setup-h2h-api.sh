#!/bin/bash

# setup-h2h-api.sh
# B2B Integration - Host-to-Host API (Phase 1756-1760)

echo ">>> Setting up H2H API Server..."

# Components Created:
# 1. supabase/migrations/20251231_h2h_api.sql
# 2. src/lib/h2h-auth.ts
# 3. src/app/api/h2h/trx/route.ts
# 4. src/app/api/h2h/status/route.ts
# 5. src/app/api/h2h/balance/route.ts

mkdir -p src/lib
mkdir -p src/app/api/h2h/trx
mkdir -p src/app/api/h2h/status
mkdir -p src/app/api/h2h/balance
mkdir -p supabase/migrations

echo ">>> API Endpoints:"
echo "  1. POST /api/h2h/balance"
echo "     Headers: X-API-Key"
echo ""
echo "  2. POST /api/h2h/trx"
echo "     Body: { service_code, target, ref_id }"
echo ""
echo "  3. POST /api/h2h/status"
echo "     Body: { trx_id } OR { ref_id }"

echo ""
echo ">>> Security Layer:"
echo "  - API Key Validation (Header: X-API-Key)"
echo "  - IP Whitelist (Enforced in DB)"
echo "  - Standard JSON Response Format"

echo ""
echo ">>> Response Format:"
echo "  {"
echo "    'status': true,"
echo "    'response_code': 200,"
echo "    'message': 'Success',"
echo "    'data': { ... }"
echo "  }"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
echo "API Ready at /api/h2h/*"
