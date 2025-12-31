#!/bin/bash

# setup-log-pruning.sh
# Data Hygiene - Log Pruning System (Phase 1791-1795)

echo ">>> Setting up Log Pruning..."

# Components Created:
# 1. supabase/migrations/20251231_log_pruning.sql

echo ">>> Features:"
echo "  1. Function: prune_old_logs()"
echo "     - Deletes data older than 30 days"
echo "     - Targets: api_logs, webhook_logs, notification_history, h2h_request_logs"
echo "  2. Scheduler: pg_cron"
echo "     - Schedule: '0 0 * * 0' (Every Sunday Midnight)"

echo ""
echo ">>> Requirement:"
echo "  Ensure 'pg_cron' extension is enabled in your Supabase Dashboard:"
echo "  Database -> Extensions -> pg_cron"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
