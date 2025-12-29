#!/bin/bash

# =============================================================================
# Security: Emergency Circuit Breaker
# =============================================================================

echo "Initializing Circuit Breaker..."
echo "================================================="

# 1. SQL Schema & Logic
echo "1. Generating SQL: circuit_breaker.sql"
cat <<EOF > circuit_breaker.sql
-- Key-Value Store for System Settings (Flags)
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Default Settings
INSERT INTO public.system_settings (key, value)
VALUES ('finance_maintenance_mode', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Function: Check Velocity & Trigger Breaker
CREATE OR REPLACE FUNCTION check_financial_velocity() RETURNS TRIGGER AS \$\$
DECLARE
    v_total_outflow DECIMAL;
    v_limit DECIMAL := 10000000; -- Limit Rp 10 Juta / Jam
    v_maintenance BOOLEAN;
BEGIN
    -- 1. Check if already in Maintenance Mode
    SELECT (value->>'mode')::boolean INTO v_maintenance 
    FROM public.system_settings 
    WHERE key = 'finance_maintenance_mode';
    
    IF v_maintenance IS TRUE THEN
        RAISE EXCEPTION 'SYSTEM_LOCKED: Financial Maintenance Mode is Active.';
    END IF;

    -- 2. Calculate Total Outflow (Withdrawals) in last 1 Hour
    -- Status should be 'COMPLETED' or 'PROCESSING' or 'REQUESTED' (if we count attempts)
    SELECT COALESCE(SUM(amount), 0) INTO v_total_outflow
    FROM public.withdrawal_requests
    WHERE created_at > (NOW() - INTERVAL '1 hour');
    
    -- Add current request amount
    v_total_outflow := v_total_outflow + NEW.amount;

    -- 3. Check Threshold
    IF v_total_outflow > v_limit THEN
        -- !!! EMERGENCY STOP !!!
        
        -- A. Lock System
        UPDATE public.system_settings 
        SET value = 'true'::jsonb, updated_at = NOW()
        WHERE key = 'finance_maintenance_mode';
        
        -- B. Raise Error
        RAISE EXCEPTION 'EMERGENCY_STOP: Velocity Limit Exceeded (% > %). System Locked.', v_total_outflow, v_limit;
    END IF;

    RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

-- Bind Trigger to Withdrawal Requests
DROP TRIGGER IF EXISTS tr_velocity_check ON public.withdrawal_requests;
CREATE TRIGGER tr_velocity_check
BEFORE INSERT ON public.withdrawal_requests
FOR EACH ROW EXECUTE FUNCTION check_financial_velocity();

EOF

# 2. Helper Library
echo "2. Creating Lib: lib/circuit-breaker.ts"
mkdir -p lib
cat <<EOF > lib/circuit-breaker.ts
import { createClient } from '@/utils/supabase/server';

export async function isSystemLocked() {
    const supabase = createClient();
    const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'finance_maintenance_mode')
        .single();
        
    return data?.value === true; // or check JSON structure
}

export async function sendPanicAlert(message: string) {
    console.error(\`[PANIC] \${message}\`);
    // Connect to WhatsApp API here
    // await whatsapp.sendText(ADMIN_PHONE, \`🚨 EMERGENCY: \${message}\`);
}
EOF

echo ""
echo "================================================="
echo "Circuit Breaker Ready!"
echo "Run 'circuit_breaker.sql' to install the safety valve."
