-- Warehouse Inventory (Users' stored items)
CREATE TABLE IF NOT EXISTS public.warehouse_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    sku TEXT NOT NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
    last_inbound_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, sku)
);

-- Warehouse Logs (History of In/Out)
CREATE TABLE IF NOT EXISTS public.warehouse_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_id UUID REFERENCES public.warehouse_inventory(id),
    type TEXT CHECK (type IN ('INBOUND', 'OUTBOUND', 'ADJUSTMENT')),
    amount INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing Log (To track daily deductions)
CREATE TABLE IF NOT EXISTS public.warehouse_billing_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    total_items INTEGER NOT NULL,
    total_cost DECIMAL(19,4) NOT NULL,
    billed_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
