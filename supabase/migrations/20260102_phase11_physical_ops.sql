-- ============================================
-- GOD MODE PHASE 801-900: PHYSICAL OPERATIONS
-- O2O Agents, IoT Devices, Fleet Tracking
-- ============================================
-- AGENTS TABLE (O2O Network)
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    agent_code VARCHAR(50) UNIQUE NOT NULL,
    business_name VARCHAR(255),
    location_address TEXT,
    location_lat DECIMAL(10, 8),
    location_long DECIMAL(11, 8),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED')
    ),
    pos_balance DECIMAL(15, 2) DEFAULT 0,
    kyc_docs JSONB,
    -- {id_card_url, selfie_url, business_permit_url}
    commission_rate DECIMAL(5, 2) DEFAULT 2.5,
    -- Percentage
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- AGENT TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.agent_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (
        type IN ('TOPUP', 'WITHDRAWAL', 'SALE', 'COMMISSION')
    ),
    amount DECIMAL(15, 2) NOT NULL,
    balance_before DECIMAL(15, 2),
    balance_after DECIMAL(15, 2),
    reference_id VARCHAR(100),
    -- Order ID or Transaction ID
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- IOT DEVICES TABLE (Hardware Registry)
CREATE TABLE IF NOT EXISTS public.iot_devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id VARCHAR(100) UNIQUE NOT NULL,
    -- MAC address or serial number
    device_type VARCHAR(50) CHECK (
        device_type IN (
            'THERMAL_PRINTER',
            'SMART_LOCKER',
            'BARCODE_SCANNER',
            'WEIGHING_SCALE'
        )
    ),
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'OFFLINE' CHECK (
        status IN ('ONLINE', 'OFFLINE', 'ERROR', 'MAINTENANCE')
    ),
    last_heartbeat TIMESTAMP WITH TIME ZONE,
    battery_level INT CHECK (
        battery_level >= 0
        AND battery_level <= 100
    ),
    firmware_version VARCHAR(50),
    error_message TEXT,
    metadata JSONB,
    -- Device-specific data (paper status, locker capacity, etc.)
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- FLEET DRIVERS TABLE (GPS Tracking)
CREATE TABLE IF NOT EXISTS public.fleet_drivers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    driver_code VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50) CHECK (
        vehicle_type IN ('MOTORCYCLE', 'CAR', 'VAN', 'TRUCK')
    ),
    vehicle_plate VARCHAR(50),
    current_lat DECIMAL(10, 8),
    current_long DECIMAL(11, 8),
    status VARCHAR(20) DEFAULT 'IDLE' CHECK (
        status IN ('IDLE', 'DELIVERING', 'RETURNING', 'OFFLINE')
    ),
    current_order_id UUID,
    speed_kmh DECIMAL(5, 2),
    battery_level INT CHECK (
        battery_level >= 0
        AND battery_level <= 100
    ),
    last_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_location ON public.agents(location_lat, location_long);
CREATE INDEX IF NOT EXISTS idx_agent_trans_agent ON public.agent_transactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_trans_created ON public.agent_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_iot_devices_agent ON public.iot_devices(agent_id);
CREATE INDEX IF NOT EXISTS idx_iot_devices_status ON public.iot_devices(status);
CREATE INDEX IF NOT EXISTS idx_iot_devices_heartbeat ON public.iot_devices(last_heartbeat DESC);
CREATE INDEX IF NOT EXISTS idx_fleet_status ON public.fleet_drivers(status);
CREATE INDEX IF NOT EXISTS idx_fleet_location ON public.fleet_drivers(current_lat, current_long);
CREATE INDEX IF NOT EXISTS idx_fleet_last_update ON public.fleet_drivers(last_update DESC);
-- Row Level Security
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_drivers ENABLE ROW LEVEL SECURITY;
-- Policies
DROP POLICY IF EXISTS "Agents can view own data" ON public.agents;
CREATE POLICY "Agents can view own data" ON public.agents FOR
SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Drivers can view own data" ON public.fleet_drivers;
CREATE POLICY "Drivers can view own data" ON public.fleet_drivers FOR
SELECT USING (auth.uid() = user_id);
-- Function to update agent balance
CREATE OR REPLACE FUNCTION update_agent_balance(
        p_agent_id UUID,
        p_type VARCHAR,
        p_amount DECIMAL,
        p_reference_id VARCHAR DEFAULT NULL
    ) RETURNS void AS $$
DECLARE v_current_balance DECIMAL;
v_new_balance DECIMAL;
BEGIN -- Get current balance
SELECT pos_balance INTO v_current_balance
FROM public.agents
WHERE id = p_agent_id;
-- Calculate new balance
IF p_type IN ('TOPUP', 'COMMISSION') THEN v_new_balance := v_current_balance + p_amount;
ELSE v_new_balance := v_current_balance - p_amount;
END IF;
-- Update balance
UPDATE public.agents
SET pos_balance = v_new_balance,
    updated_at = now()
WHERE id = p_agent_id;
-- Log transaction
INSERT INTO public.agent_transactions (
        agent_id,
        type,
        amount,
        balance_before,
        balance_after,
        reference_id
    )
VALUES (
        p_agent_id,
        p_type,
        p_amount,
        v_current_balance,
        v_new_balance,
        p_reference_id
    );
END;
$$ LANGUAGE plpgsql;
-- Function to check IoT device online status
CREATE OR REPLACE FUNCTION get_offline_devices() RETURNS TABLE (
        device_id VARCHAR,
        device_type VARCHAR,
        agent_id UUID,
        minutes_offline INT
    ) AS $$ BEGIN RETURN QUERY
SELECT d.device_id,
    d.device_type,
    d.agent_id,
    EXTRACT(
        EPOCH
        FROM (now() - d.last_heartbeat)
    )::INT / 60 as minutes_offline
FROM public.iot_devices d
WHERE d.last_heartbeat < now() - INTERVAL '5 minutes'
    OR d.last_heartbeat IS NULL;
END;
$$ LANGUAGE plpgsql;
-- Function to get active fleet drivers
CREATE OR REPLACE FUNCTION get_active_fleet() RETURNS TABLE (
        driver_id UUID,
        driver_code VARCHAR,
        vehicle_type VARCHAR,
        current_lat DECIMAL,
        current_long DECIMAL,
        status VARCHAR,
        battery_level INT
    ) AS $$ BEGIN RETURN QUERY
SELECT f.id,
    f.driver_code,
    f.vehicle_type,
    f.current_lat,
    f.current_long,
    f.status,
    f.battery_level
FROM public.fleet_drivers f
WHERE f.last_update > now() - INTERVAL '1 minute'
    AND f.status != 'OFFLINE';
END;
$$ LANGUAGE plpgsql;
COMMENT ON TABLE public.agents IS 'O2O agent network for physical locations';
COMMENT ON TABLE public.agent_transactions IS 'POS transaction log for agents';
COMMENT ON TABLE public.iot_devices IS 'IoT device registry (printers, lockers, scanners)';
COMMENT ON TABLE public.fleet_drivers IS 'Fleet tracking for delivery drivers with GPS';