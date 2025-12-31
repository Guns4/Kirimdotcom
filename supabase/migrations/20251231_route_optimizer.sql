-- Route Optimizations Table
CREATE TABLE IF NOT EXISTS route_optimizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    filename TEXT NOT NULL,
    total_packages INTEGER NOT NULL,
    status TEXT CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED')) DEFAULT 'PROCESSING',
    savings_amount DECIMAL(12, 2) DEFAULT 0,
    strategy TEXT NOT NULL, -- 'CHEAPEST', 'FASTEST', 'BALANCED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optimization Results (per package row)
CREATE TABLE IF NOT EXISTS route_optimization_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    optimization_id UUID REFERENCES route_optimizations(id) ON DELETE CASCADE,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    weight DECIMAL(10, 2) NOT NULL,
    selected_courier TEXT NOT NULL,
    selected_price DECIMAL(12, 2) NOT NULL,
    original_price DECIMAL(12, 2), -- Price if using single main courier
    estimated_days TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE route_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_optimization_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own optimizations" ON route_optimizations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own optimizations" ON route_optimizations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own results" ON route_optimization_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM route_optimizations 
            WHERE route_optimizations.id = route_optimization_results.optimization_id 
            AND route_optimizations.user_id = auth.uid()
        )
    );
