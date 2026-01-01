-- ============================================
-- GOD MODE PHASE 1701-1800: CX & UX FORENSICS
-- Session Replay, NPS, Rage Click Detection
-- ============================================
-- USER SESSIONS TABLE (Session Replay Data)
CREATE TABLE IF NOT EXISTS public.cx_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    session_duration INT DEFAULT 0,
    -- seconds
    page_visited TEXT,
    device_info JSONB,
    -- browser, OS, screen size
    events_json_url TEXT,
    -- URL to JSON file with DOM events
    has_errors BOOLEAN DEFAULT false,
    has_rage_clicks BOOLEAN DEFAULT false,
    error_count INT DEFAULT 0,
    rage_click_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- NPS SCORES TABLE (Net Promoter Score)
CREATE TABLE IF NOT EXISTS public.cx_nps_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    score INT CHECK (
        score >= 0
        AND score <= 10
    ),
    feedback_text TEXT,
    category VARCHAR(20) CHECK (
        category IN ('UI', 'SERVICE', 'SPEED', 'FEATURE', 'OTHER')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- UX ISSUES TABLE (Forensics & Analytics)
CREATE TABLE IF NOT EXISTS public.cx_ux_issues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url_path TEXT NOT NULL,
    element_selector TEXT,
    -- CSS selector of problematic element
    issue_type VARCHAR(20) CHECK (
        issue_type IN (
            'RAGE_CLICK',
            'DEAD_CLICK',
            'JS_ERROR',
            'SLOW_LOAD'
        )
    ),
    click_count INT DEFAULT 0,
    impact_level VARCHAR(10) DEFAULT 'LOW' CHECK (impact_level IN ('LOW', 'MEDIUM', 'HIGH')),
    first_occurred TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_occurred TIMESTAMP WITH TIME ZONE DEFAULT now(),
    total_occurrences INT DEFAULT 1
);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cx_sessions_user ON public.cx_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_cx_sessions_errors ON public.cx_sessions(has_errors);
CREATE INDEX IF NOT EXISTS idx_cx_sessions_rage ON public.cx_sessions(has_rage_clicks);
CREATE INDEX IF NOT EXISTS idx_cx_sessions_created ON public.cx_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nps_score ON public.cx_nps_scores(score);
CREATE INDEX IF NOT EXISTS idx_nps_created ON public.cx_nps_scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ux_issues_type ON public.cx_ux_issues(issue_type);
CREATE INDEX IF NOT EXISTS idx_ux_issues_impact ON public.cx_ux_issues(impact_level);
-- Row Level Security
ALTER TABLE public.cx_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cx_nps_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cx_ux_issues ENABLE ROW LEVEL SECURITY;
-- Function to calculate NPS score
CREATE OR REPLACE FUNCTION calculate_nps_score() RETURNS TABLE (
        nps_score INT,
        promoters_count BIGINT,
        passives_count BIGINT,
        detractors_count BIGINT,
        total_responses BIGINT
    ) AS $$
DECLARE total BIGINT;
promoters BIGINT;
detractors BIGINT;
BEGIN
SELECT COUNT(*) INTO total
FROM public.cx_nps_scores;
-- Promoters: score 9-10
SELECT COUNT(*) INTO promoters
FROM public.cx_nps_scores
WHERE score >= 9;
-- Detractors: score 0-6
SELECT COUNT(*) INTO detractors
FROM public.cx_nps_scores
WHERE score <= 6;
-- NPS = (% Promoters - % Detractors) * 100
-- Range: -100 to +100
RETURN QUERY
SELECT CASE
        WHEN total = 0 THEN 0
        ELSE ROUND(
            (promoters::DECIMAL / total * 100) - (detractors::DECIMAL / total * 100)
        )::INT
    END as nps_score,
    promoters as promoters_count,
    (
        SELECT COUNT(*)
        FROM public.cx_nps_scores
        WHERE score BETWEEN 7 AND 8
    ) as passives_count,
    detractors as detractors_count,
    total as total_responses;
END;
$$ LANGUAGE plpgsql;
-- Function to get top UX issues
CREATE OR REPLACE FUNCTION get_top_ux_issues(p_limit INT DEFAULT 10) RETURNS TABLE (
        url_path TEXT,
        issue_type VARCHAR,
        total_occurrences INT,
        impact_level VARCHAR
    ) AS $$ BEGIN RETURN QUERY
SELECT ui.url_path,
    ui.issue_type,
    ui.total_occurrences,
    ui.impact_level
FROM public.cx_ux_issues ui
WHERE ui.impact_level IN ('HIGH', 'MEDIUM')
ORDER BY ui.total_occurrences DESC,
    ui.last_occurred DESC
LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
COMMENT ON TABLE public.cx_sessions IS 'User session recordings for UX analysis and debugging';
COMMENT ON TABLE public.cx_nps_scores IS 'Net Promoter Score feedback from users';
COMMENT ON TABLE public.cx_ux_issues IS 'Detected UX issues like rage clicks and errors';