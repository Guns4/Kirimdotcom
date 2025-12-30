-- Route Optimizer Schema
-- For B2B Intelligence - Bulk Shipping Optimization

CREATE TABLE IF NOT EXISTS route_optimizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Upload Info
    filename TEXT NOT NULL,
    total_packages INT NOT NULL,
    
    -- Results
    optimization_data JSONB NOT NULL, -- Array of packages with recommendations
    
    -- Savings Summary
    single_courier_cost DECIMAL(15, 2), -- Cost if using one courier
    single_courier_name TEXT,
    optimized_cost DECIMAL(15, 2), -- Cost with mix strategy
    total_savings DECIMAL(15, 2),
    savings_percentage DECIMAL(5, 2),
    
    -- Metadata
    optimization_criteria TEXT DEFAULT 'CHEAPEST', -- CHEAPEST, FASTEST, BALANCED
    status TEXT DEFAULT 'COMPLETED', -- PROCESSING, COMPLETED, FAILED
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE route_optimizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own optimizations"
ON route_optimizations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create optimizations"
ON route_optimizations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_route_optimizations_user_id ON route_optimizations(user_id);
CREATE INDEX idx_route_optimizations_created_at ON route_optimizations(created_at DESC);
