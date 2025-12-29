-- 1. Rename Old Table (Safety First)
ALTER TABLE IF EXISTS public.tracking_logs RENAME TO tracking_logs_legacy;

-- 2. Create Parent Table (Partitioned)
CREATE TABLE IF NOT EXISTS public.tracking_logs (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    provider TEXT NOT NULL,
    awb TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    metadata JSONB,
    PRIMARY KEY (id, created_at) -- Partition key must be part of PK
) PARTITION BY RANGE (created_at);

-- 3. Create Partitions for 2024 and 2025
CREATE TABLE public.tracking_logs_2024 PARTITION OF public.tracking_logs
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE public.tracking_logs_2025 PARTITION OF public.tracking_logs
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
    
-- 4. Enable RLS (Must be done on Parent)
ALTER TABLE public.tracking_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own logs" ON public.tracking_logs
    FOR SELECT USING (auth.uid() = user_id);

-- 5. Data Migration (Optional - Comment out if table is huge)
-- INSERT INTO public.tracking_logs SELECT * FROM public.tracking_logs_legacy;

-- 6. Automation: Function to create next year's partition
CREATE OR REPLACE FUNCTION create_next_year_partition() RETURNS void AS $$
DECLARE
    next_year INTEGER;
    start_date TEXT;
    end_date TEXT;
    table_name TEXT;
BEGIN
    next_year := extract(year from now()) + 1;
    start_date := next_year || '-01-01';
    end_date := (next_year + 1) || '-01-01';
    table_name := 'tracking_logs_' || next_year;
    
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS public.%I PARTITION OF public.tracking_logs FOR VALUES FROM (%L) TO (%L)',
        table_name, start_date, end_date
    );
END;
$$ LANGUAGE plpgsql;

-- 7. Schedule via pg_cron (if available)
-- SELECT cron.schedule('partition-maintenance', '0 0 1 12 *', 'SELECT create_next_year_partition()');
