#!/bin/bash

# Category 1: Fondasi & Infrastruktur
# Execute in sub-batches for better control

source ./master-runner.sh

echo "Starting Category 1: Fondasi & Infrastruktur (41 scripts)"

# Batch 1A: Database & Security Foundation (10 scripts)
BATCH_1A=(
    "scripts/setup-db-rls.sh"
    "scripts/setup-secure-headers.sh"
    "scripts/setup-api-dashboard.sh"
    "scripts/setup-rate-limit.sh"
    "scripts/setup-rbac.sh"
    "scripts/setup-role-middleware.sh"
    "scripts/setup-domain-middleware.sh"
    "scripts/setup-custom-domain.sh"
    "scripts/setup-custom-domains.sh"
    "scripts/setup-cname-automator.sh"
)

execute_batch "Category 1A - Database & Security" "${BATCH_1A[@]}"
BATCH_1A_RESULT=$?

# Batch 1B: Monitoring & Backup (17 scripts)
BATCH_1B=(
    "scripts/setup-cloudflare-waf.sh"
    "scripts/setup-fail2ban.sh"
    "scripts/setup-auto-backup.sh"
    "scripts/setup-bunker-backup.sh"
    "scripts/setup-health-check.sh"
    "scripts/setup-uptime-monitor.sh"
    "scripts/setup-error-monitoring.sh"
    "scripts/setup-performance-monitoring.sh"
    "scripts/setup-sentry.sh"
    "scripts/setup-vercel-analytics.sh"
    "scripts/setup-vercel-insights.sh"
    "scripts/setup-consistency.sh"
    "scripts/setup-dependency-lock.sh"
    "scripts/setup-knip.sh"
    "scripts/setup-audit-logs.sh"
    "scripts/setup-immutable-logs.sh"
    "scripts/setup-log-pruning.sh"
)

execute_batch "Category 1B - Monitoring & Backup" "${BATCH_1B[@]}"
BATCH_1B_RESULT=$?

# Batch 1C: Mobile Security (6 scripts)
BATCH_1C=(
    "scripts/setup-staff-logs.sh"
    "scripts/setup-security-txt.sh"
    "scripts/setup-ssl-pinning.sh"
    "scripts/setup-root-detection.sh"
    "scripts/setup-tamper-proof.sh"
    "scripts/setup-apk-obfuscation.sh"
)

execute_batch "Category 1C - Mobile Security" "${BATCH_1C[@]}"
BATCH_1C_RESULT=$?

# Batch 1D: Critical Systems (8 scripts)
BATCH_1D=(
    "scripts/setup-app-security.sh"
    "scripts/setup-emulator-block.sh"
    "scripts/setup-multi-sig.sh"
    "scripts/setup-dead-mans-switch.sh"
    "scripts/setup-panic-button.sh"
    "scripts/setup-feature-flags.sh"
    "scripts/setup-feature-flags-v2.sh"
    "scripts/setup-client-feature-flags.sh"
)

execute_batch "Category 1D - Critical Systems" "${BATCH_1D[@]}"
BATCH_1D_RESULT=$?

# Category 1 Summary
echo ""
echo "╔════════════════════════════════════════╗"
echo "║  CATEGORY 1 COMPLETE                   ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Batch 1A (Database & Security): Exit Code $BATCH_1A_RESULT"
echo "Batch 1B (Monitoring & Backup): Exit Code $BATCH_1B_RESULT"
echo "Batch 1C (Mobile Security): Exit Code $BATCH_1C_RESULT"
echo "Batch 1D (Critical Systems): Exit Code $BATCH_1D_RESULT"
echo ""

# Exit with error if any batch failed
if [ $BATCH_1A_RESULT -ne 0 ] || [ $BATCH_1B_RESULT -ne 0 ] || [ $BATCH_1C_RESULT -ne 0 ] || [ $BATCH_1D_RESULT -ne 0 ]; then
    exit 1
fi

exit 0
