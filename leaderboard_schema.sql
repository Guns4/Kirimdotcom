-- Function: Get Weekly Leaderboard
-- Aggregates positive point history in the last 7 days
CREATE OR REPLACE FUNCTION get_weekly_leaderboard(limit_count int DEFAULT 10)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    avatar_url TEXT,
    weekly_score BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ph.user_id,
        p.full_name,
        p.avatar_url,
        SUM(ph.points_change) as weekly_score
    FROM 
        public.point_history ph
    JOIN 
        public.profiles p ON ph.user_id = p.id
    WHERE 
        ph.points_change > 0 
        AND ph.created_at >= (NOW() - INTERVAL '7 days')
    GROUP BY 
        ph.user_id, p.full_name, p.avatar_url
    ORDER BY 
        weekly_score DESC
    LIMIT 
        limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Award Weekly Winner
-- Can be called by cron every Monday
CREATE OR REPLACE FUNCTION process_weekly_champion_reward()
RETURNS JSONB AS $$
DECLARE
    v_winner_id UUID;
    v_score BIGINT;
    v_reward_amount INT := 1000; -- 1000 Points for #1
BEGIN
    -- Find Winner
    SELECT user_id, weekly_score INTO v_winner_id, v_score
    FROM get_weekly_leaderboard(1);
    
    IF v_winner_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'No winner found');
    END IF;

    -- Award Points (Reusing existing award_points if available, or manual insert)
    -- Assuming award_points(user_id, points, type, description) exists from previous step
    PERFORM award_points(
        v_winner_id, 
        v_reward_amount, 
        'weekly_champion', 
        'Winner of Weekly Leaderboard (' || v_score || ' pts)'
    );

    RETURN jsonb_build_object(
        'success', true, 
        'winner_id', v_winner_id, 
        'reward', v_reward_amount
    );
END;
$$ LANGUAGE plpgsql;
