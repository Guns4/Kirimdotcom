#!/bin/bash

# setup-dynamic-limiter.sh
# Server Protection - Dynamic Rate Limiter (Phase 1781-1785)

echo ">>> Setting up Dynamic Rate Limiter..."

# Components Created:
# 1. src/lib/rate-limiter.ts

echo ">>> Features:"
echo "  1. Traffic Monitor: Counts requests per IP"
echo "  2. Penalty System:"
echo "     - Normal: >1 req/s (Monitoring)"
echo "     - Abuse: >10 req/s -> BLOCKED for 10 Minutes"
echo "  3. Notification: Auto-email on abuse detection"

echo ""
echo ">>> Integration Usage (Middleware):"
echo "  import { checkRateLimit } from '@/lib/rate-limiter';"
echo "  const limit = await checkRateLimit(req.ip);"
echo "  if (!limit.allowed) return new Response(limit.reason, { status: 429 });"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
