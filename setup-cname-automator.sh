#!/bin/bash

# setup-cname-automator.sh
# Branding Authority - CNAME Automation (Phase 1771-1775)

echo ">>> Setting up CNAME Automator..."

# Components Created:
# 1. src/lib/domain-manager.ts

echo ">>> Service Features:"
echo "  1. addDomainToVercel(domain)   -> Register domain to Vercel Project"
echo "  2. verifyDomainConfig(domain)  -> Check DNS Propagation & SSL"
echo "  3. removeDomainFromVercel(domain)"

echo ""
echo ">>> Environment Variables Required:"
echo "  - VERCEL_PROJECT_ID"
echo "  - VERCEL_AUTH_TOKEN"
echo "  - VERCEL_TEAM_ID (Optional)"

echo ""
echo ">>> Integration Flow:"
echo "  Client inputs Custom Domain (Dashboard)"
echo "        ↓"
echo "  Backend calls addDomainToVercel()"
echo "        ↓"
echo "  Client adds CNAME Record (cname.vercel-dns.com)"
echo "        ↓"
echo "  Backend calls verifyDomainConfig()"
echo "        ↓"
echo "  Domain Active (SSL Auto-Generated)"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
