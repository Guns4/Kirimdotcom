-- =============================================
-- COURIER REVIEWS SYSTEM
-- =============================================
-- Run this in Supabase SQL Editor after other schemas
-- Table: courier_reviews
CREATE TABLE IF NOT EXISTS courier_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- User info (nullable for anonymous reviews)
    user_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        -- Courier info
        courier_code VARCHAR(20) NOT NULL,
        courier_name VARCHAR(100),
        -- Review content
        rating INTEGER NOT NULL CHECK (
            rating >= 1
            AND rating <= 5
        ),
        comment TEXT,
        sentiment VARCHAR(20) DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'negative', 'neutral')),
        -- Tracking reference (optional)
        resi_number VARCHAR(50),
        -- Metadata
        is_verified BOOLEAN DEFAULT false,
        helpful_count INTEGER DEFAULT 0,
        -- Timestamps
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_courier_reviews_courier ON courier_reviews(courier_code);
CREATE INDEX IF NOT EXISTS idx_courier_reviews_rating ON courier_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_courier_reviews_created ON courier_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_courier_reviews_user ON courier_reviews(user_id);
-- Enable RLS
ALTER TABLE courier_reviews ENABLE ROW LEVEL SECURITY;
-- RLS Policies
-- Everyone can read reviews (public data)
CREATE POLICY "Anyone can read courier reviews" ON courier_reviews FOR
SELECT TO public USING (true);
-- Authenticated users can insert reviews
CREATE POLICY "Authenticated users can insert reviews" ON courier_reviews FOR
INSERT TO authenticated WITH CHECK (true);
-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON courier_reviews FOR
UPDATE TO authenticated USING (auth.uid() = user_id);
-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON courier_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);
-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_courier_review_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_courier_reviews_timestamp BEFORE
UPDATE ON courier_reviews FOR EACH ROW EXECUTE FUNCTION update_courier_review_timestamp();
-- Function: Get courier statistics
CREATE OR REPLACE FUNCTION get_courier_statistics(
        time_period VARCHAR DEFAULT 'all' -- 'week', 'month', 'all'
    ) RETURNS TABLE (
        courier_code VARCHAR,
        courier_name VARCHAR,
        total_reviews BIGINT,
        average_rating NUMERIC,
        positive_reviews BIGINT,
        negative_reviews BIGINT,
        neutral_reviews BIGINT
    ) AS $$ BEGIN RETURN QUERY
SELECT cr.courier_code,
    cr.courier_name,
    COUNT(*)::BIGINT as total_reviews,
    ROUND(AVG(cr.rating), 2) as average_rating,
    COUNT(
        CASE
            WHEN cr.sentiment = 'positive' THEN 1
        END
    )::BIGINT as positive_reviews,
    COUNT(
        CASE
            WHEN cr.sentiment = 'negative' THEN 1
        END
    )::BIGINT as negative_reviews,
    COUNT(
        CASE
            WHEN cr.sentiment = 'neutral' THEN 1
        END
    )::BIGINT as neutral_reviews
FROM courier_reviews cr
WHERE CASE
        WHEN time_period = 'week' THEN cr.created_at >= NOW() - INTERVAL '7 days'
        WHEN time_period = 'month' THEN cr.created_at >= NOW() - INTERVAL '30 days'
        ELSE TRUE
    END
GROUP BY cr.courier_code,
    cr.courier_name
ORDER BY average_rating DESC,
    total_reviews DESC;
END;
$$ LANGUAGE plpgsql;
-- =============================================
-- COMPLETED
-- =============================================
-- Review system ready!
-- Use get_courier_statistics('month') for leaderboard data