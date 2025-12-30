-- Bulk Label Generator Schema
-- For tracking bulk label generation batches

CREATE TABLE IF NOT EXISTS bulk_label_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    route_optimization_id UUID REFERENCES route_optimizations(id) ON DELETE SET NULL,
    
    -- Batch Info
    total_labels INT NOT NULL,
    courier_breakdown JSONB NOT NULL, -- {"JNE": 50, "SiCepat": 30, ...}
    
    -- Files Generated
    pdf_url TEXT, -- S3/Supabase Storage URL
    manifest_urls JSONB, -- {"JNE": "url", "SiCepat": "url", ...}
    
    -- Metadata
    status TEXT DEFAULT 'COMPLETED', -- PROCESSING, COMPLETED, FAILED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE bulk_label_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own label batches"
ON bulk_label_batches FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create label batches"
ON bulk_label_batches FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Index
CREATE INDEX idx_bulk_label_batches_user_id ON bulk_label_batches(user_id);
CREATE INDEX idx_bulk_label_batches_created_at ON bulk_label_batches(created_at DESC);
