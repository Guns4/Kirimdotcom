#!/bin/bash

# setup-agent-pos.sh
# Agent Utility & POS Setup

echo ">>> Setting up Agent POS System..."

# Components Created:
# 1. src/lib/printer-service.ts
# 2. src/components/agent/ReceiptPrinter.tsx
# 3. src/components/agent/PosLayout.tsx
# 4. src/app/agent/pos/page.tsx

echo ">>> Tips:"
echo "Web Bluetooth requires Secure Context (HTTPS) or localhost."
echo "If testing on mobile, use Chrome for Android."

echo ">>> Running Typecheck..."
npm run typecheck

echo ">>> Setup Complete!"
echo "POS Live at: http://localhost:3000/agent/pos"
