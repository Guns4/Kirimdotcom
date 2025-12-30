#!/bin/bash

# setup-ownership-transfer.sh
# Asset Transferability - Ownership Transfer Protocol

echo ">>> Setting up Ownership Transfer System..."

# Components Created:
# 1. src/lib/ownership-transfer.ts
# 2. src/components/admin/OwnershipTransferDashboard.tsx
# 3. src/app/admin/ownership-transfer/page.tsx

echo ">>> Features:"
echo "  🔐 Secret Rotation - Reset ALL API keys & secrets"
echo "  👤 Admin Transfer - Move SUPER_ADMIN to new owner"
echo "  💾 Data Export - Encrypted SQL dump"
echo "  ✓  Transfer Checklist - Complete handover protocol"

echo ""
echo ">>> Secret Rotation Covers:"
echo "  - SUPABASE_ANON_KEY"
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo "  - NEXTAUTH_SECRET"
echo "  - JWT_SECRET"
echo "  - ENCRYPTION_KEY"
echo "  - API_SECRET_KEY"
echo "  - WEBHOOK_SECRET"
echo "  - SESSION_SECRET"

echo ""
echo ">>> Transfer Steps:"
echo "  Step 1: Rotate all secrets (revoke old access)"
echo "  Step 2: Transfer SUPER_ADMIN to new owner email"
echo "  Step 3: Export encrypted database backup"
echo "  Step 4: Confirm with 'TRANSFER OWNERSHIP' text"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
echo "Transfer Page: http://localhost:3000/admin/ownership-transfer"
echo ""
echo ">>> IMPORTANT:"
echo "  1. Only accessible by current SUPER_ADMIN"
echo "  2. Pre-share transfer password securely"
echo "  3. Update environment variables in:"
echo "     - Vercel Dashboard"
echo "     - Supabase Dashboard"
echo "     - Local .env files"
