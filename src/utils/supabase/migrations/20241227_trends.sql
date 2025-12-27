-- Create table for daily stats
CREATE TABLE IF NOT EXISTS courier_stats_daily (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
    courier TEXT NOT NULL,
    avg_duration_days NUMERIC(5, 2),
    -- e.g. 2.50
    sample_size INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(stat_date, courier)
);
-- RLS
ALTER TABLE courier_stats_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON courier_stats_daily FOR
SELECT USING (true);
-- Function to Aggregate Data
CREATE OR REPLACE FUNCTION calculate_daily_courier_stats() RETURNS void AS $$ BEGIN -- Insert today's stats based on ALL historical data (or windowed if preferred)
    -- Here we calculate the "Global Average" as of today
INSERT INTO courier_stats_daily (
        stat_date,
        courier,
        avg_duration_days,
        sample_size
    )
SELECT CURRENT_DATE,
    courier,
    ROUND(
        AVG(
            EXTRACT(
                EPOCH
                FROM (
                        COALESCE(
                            (raw_data->'data'->'summary'->>'date')::timestamp,
                            last_updated
                        ) - created_at
                    )
            ) / 86400
        )::numeric,
        2
    ) as avg_days,
    COUNT(*) as sample_count
FROM cached_resi
WHERE is_delivered = TRUE
    AND created_at IS NOT NULL -- Filter outliers (e.g., negative duration or > 30 days) if needed
    AND EXTRACT(
        EPOCH
        FROM (last_updated - created_at)
    ) > 0
GROUP BY courier ON CONFLICT (stat_date, courier) DO
UPDATE
SET avg_duration_days = EXCLUDED.avg_duration_days,
    sample_size = EXCLUDED.sample_size,
    created_at = NOW();
END;
$$ LANGUAGE plpgsql;
-- Grant execute to service role (standard)
GRANT EXECUTE ON FUNCTION calculate_daily_courier_stats TO service_role;