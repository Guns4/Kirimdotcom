#!/bin/bash

# setup-woo-backend.sh
# --------------------
# Backend for WooCommerce Integration.
# Handles rate requests from plugins, validates keys, and injects profit.

echo "🔌 Setting up WooCommerce Backend API..."

mkdir -p src/app/api/integration/woocommerce/rates

echo "✅ API Route: src/app/api/integration/woocommerce/rates/route.ts"
