-- User Inventory Table to track estimated supplies
CREATE TABLE IF NOT EXISTS public.user_supply_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL, -- 'lakban', 'plastik'
    estimated_stock DECIMAL(19,4) NOT NULL DEFAULT 0, -- in Meters or Units
    last_restock_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, item_type)
);

-- Table to store Generated Alerts
CREATE TABLE IF NOT EXISTS public.supply_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL, -- 'LOW_STOCK_Lakban'
    message TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
