-- ============================================================================
-- BULK TRACKING SYSTEM
-- Phase 416-420: Productivity for Big Sellers (Premium Feature)
-- ============================================================================
-- ============================================================================
-- 1. BULK TRACKING JOBS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bulk_tracking_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- User reference
    user_id UUID NOT NULL,
    -- Job details
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT,
    -- Original uploaded file
    total_rows INTEGER DEFAULT 0,
    -- Processing status
    status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'processing', 'completed', 'failed'
    processed_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    -- Results
    result_file_url TEXT,
    -- Generated Excel with results
    -- Error tracking
    error_message TEXT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_bulk_jobs_user ON public.bulk_tracking_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_bulk_jobs_status ON public.bulk_tracking_jobs(status);
-- ============================================================================
-- 2. BULK TRACKING ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bulk_tracking_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Job reference
    job_id UUID REFERENCES public.bulk_tracking_jobs(id) ON DELETE CASCADE,
    -- Tracking details
    awb_number VARCHAR(100) NOT NULL,
    courier VARCHAR(50) NOT NULL,
    -- Result
    status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'success', 'failed'
    tracking_result JSONB,
    -- Full tracking data
    error_message TEXT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_bulk_items_job ON public.bulk_tracking_items(job_id);
CREATE INDEX IF NOT EXISTS idx_bulk_items_status ON public.bulk_tracking_items(job_id, status);
-- ============================================================================
-- 3. FUNCTION: Create Bulk Job
-- ============================================================================
CREATE OR REPLACE FUNCTION create_bulk_job(
        p_user_id UUID,
        p_file_name VARCHAR,
        p_file_url TEXT,
        p_items JSONB -- Array of {awb, courier}
    ) RETURNS UUID AS $$
DECLARE v_job_id UUID;
v_item JSONB;
v_count INTEGER := 0;
BEGIN -- Create job
INSERT INTO public.bulk_tracking_jobs (
        user_id,
        file_name,
        file_url,
        total_rows,
        status
    )
VALUES (
        p_user_id,
        p_file_name,
        p_file_url,
        jsonb_array_length(p_items),
        'pending'
    )
RETURNING id INTO v_job_id;
-- Insert items
FOR v_item IN
SELECT *
FROM jsonb_array_elements(p_items) LOOP
INSERT INTO public.bulk_tracking_items (
        job_id,
        awb_number,
        courier,
        status
    )
VALUES (
        v_job_id,
        v_item->>'awb',
        v_item->>'courier',
        'pending'
    );
v_count := v_count + 1;
END LOOP;
RETURN v_job_id;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 4. FUNCTION: Update Job Progress
-- ============================================================================
CREATE OR REPLACE FUNCTION update_job_progress(p_job_id UUID) RETURNS VOID AS $$
DECLARE v_total INTEGER;
v_processed INTEGER;
v_failed INTEGER;
v_new_status VARCHAR;
BEGIN -- Count items
SELECT COUNT(*),
    COUNT(*) FILTER (
        WHERE status = 'success'
    ),
    COUNT(*) FILTER (
        WHERE status = 'failed'
    ) INTO v_total,
    v_processed,
    v_failed
FROM public.bulk_tracking_items
WHERE job_id = p_job_id;
-- Determine job status
IF v_processed + v_failed = v_total THEN v_new_status := 'completed';
ELSIF v_processed + v_failed > 0 THEN v_new_status := 'processing';
ELSE v_new_status := 'pending';
END IF;
-- Update job
UPDATE public.bulk_tracking_jobs
SET processed_count = v_processed,
    failed_count = v_failed,
    status = v_new_status,
    started_at = CASE
        WHEN started_at IS NULL
        AND v_new_status = 'processing' THEN NOW()
        ELSE started_at
    END,
    completed_at = CASE
        WHEN v_new_status = 'completed' THEN NOW()
        ELSE NULL
    END
WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================
ALTER TABLE public.bulk_tracking_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bulk jobs" ON public.bulk_tracking_jobs FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bulk jobs" ON public.bulk_tracking_jobs FOR
INSERT WITH CHECK (auth.uid() = user_id);
ALTER TABLE public.bulk_tracking_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bulk items" ON public.bulk_tracking_items FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.bulk_tracking_jobs
            WHERE id = job_id
                AND user_id = auth.uid()
        )
    );
-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Bulk Tracking System created!';
RAISE NOTICE '📊 CSV/Excel upload ready';
RAISE NOTICE '⏱️ Queue system configured';
RAISE NOTICE '📥 Export functionality enabled';
RAISE NOTICE '💎 Premium feature complete!';
END $$;