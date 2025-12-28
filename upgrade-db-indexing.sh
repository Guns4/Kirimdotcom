#!/bin/bash

# =============================================================================
# Upgrade DB Indexing (Phase 139)
# Performance Optimization
# =============================================================================

echo "Generating DB Optimization Script..."
echo "================================================="
echo ""

# 1. Generate SQL
echo "1. Creating SQL: optimize_indexes.sql"

cat <<EOF > optimize_indexes.sql
-- Performance Optimization Script
-- Strategy: Add indexes to frequently filtered columns

-- 1. Transactions Optimization
-- Frequent queries: "My Orders" (user_id), "Admin Pending" (status), "Reports" (created_at + status)

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_id 
ON public.transactions(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_status_created 
ON public.transactions(status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_resi 
ON public.transactions(resi_number) 
WHERE resi_number IS NOT NULL;  -- Partial index for efficiency

-- 2. Tracking History Optimization
-- Frequent queries: "Check Receipt" (courier + waybill), "My History" (user_id)

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracking_lookup 
ON public.tracking_history(courier_code, waybill);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracking_user 
ON public.tracking_history(user_id, updated_at DESC);

-- 3. Maintenance (Vacuum)
-- Reclaims storage and updates planner statistics
VACUUM ANALYZE public.transactions;
VACUUM ANALYZE public.tracking_history;

-- 4. PPOB & Favorites (From previous phases)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user 
ON public.user_favorites(user_id, type);

EOF
echo "   [✓] optimize_indexes.sql created."
echo ""

# Instructions
echo "================================================="
echo "Setup Complete!"
echo "1. Run the SQL script in your Supabase SQL Editor."
echo "   Note: 'CONCURRENTLY' indexes might take longer but won't lock your DB."
