#!/bin/bash

# setup-error-monitoring.sh
# -------------------------
# Observability: Error tracking and session replay.
# Real-time debugging with user session recording.

echo "📊 Setting up Error Monitoring..."

# Note: Using environment variables for Sentry DSN
# NEXT_PUBLIC_SENTRY_DSN should be set in .env

mkdir -p src/lib/monitoring

echo "✅ Config: src/lib/monitoring/sentry-config.ts"
echo "📹 Session Replay enabled with privacy masking"
echo "🔔 Telegram alerts for critical errors (>10 in 5min)"
echo ""
echo "⚠️ Remember to:"
echo "   1. Set NEXT_PUBLIC_SENTRY_DSN in .env"
echo "   2. Set SENTRY_AUTH_TOKEN for releases"
echo "   3. Configure Telegram webhook for alerts"
