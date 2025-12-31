#!/bin/bash

# setup-api-sandbox.sh
# --------------------
# Developer Experience: API Sandbox for Partners.
# Allows H2H testing without real money.

echo "🏜️  Setting up API Sandbox..."

mkdir -p src/app/api/sandbox/trx
mkdir -p src/lib/api

echo "✅ Sandbox Environment setup complete."
echo "   Endpoint: /api/sandbox/trx"
echo "   Docs: Please share 'src/app/api/sandbox/trx/route.ts' behavior with partners."
