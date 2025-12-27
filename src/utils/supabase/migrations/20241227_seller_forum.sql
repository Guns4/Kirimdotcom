-- ============================================================================
-- SELLER FORUM / COMMUNITY DISCUSSION
-- Phase 406-410: Community Engagement & Forum System
-- ============================================================================
-- ============================================================================
-- 1. FORUM CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.forum_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Category details
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    -- Emoji or icon name
    -- Display order
    display_order INTEGER DEFAULT 0,
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Seed categories
INSERT INTO public.forum_categories (name, slug, description, icon, display_order)
VALUES (
        'Curhat Ekspedisi',
        'curhat-ekspedisi',
        'Share pengalaman dengan ekspedisi pengiriman',
        '📦',
        1
    ),
    (
        'Tips Jualan',
        'tips-jualan',
        'Tips dan trik untuk meningkatkan penjualan',
        '💡',
        2
    ),
    (
        'Info Marketplace',
        'info-marketplace',
        'Update dan info seputar marketplace',
        '🛒',
        3
    ),
    (
        'Tanya Jawab',
        'tanya-jawab',
        'Tanya jawab seputar bisnis online',
        '❓',
        4
    ),
    (
        'Off Topic',
        'off-topic',
        'Obrolan santai dan ngobrol ringan',
        '💬',
        5
    ) ON CONFLICT DO NOTHING;
-- ============================================================================
-- 2. FORUM THREADS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.forum_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Thread details
    category_id UUID REFERENCES public.forum_categories(id) ON DELETE
    SET NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        -- Author
        author_id UUID NOT NULL,
        author_name VARCHAR(255),
        -- Engagement metrics
        views_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        likes_count INTEGER DEFAULT 0,
        -- Status
        is_pinned BOOLEAN DEFAULT false,
        is_locked BOOLEAN DEFAULT false,
        is_deleted BOOLEAN DEFAULT false,
        -- Moderation
        deleted_by UUID,
        deleted_at TIMESTAMPTZ,
        delete_reason TEXT,
        -- Timestamps
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        last_activity_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON public.forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author ON public.forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_activity ON public.forum_threads(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_threads_slug ON public.forum_threads(slug);
-- ============================================================================
-- 3. FORUM COMMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.forum_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Comment details
    thread_id UUID REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    -- Author
    author_id UUID NOT NULL,
    author_name VARCHAR(255),
    -- Engagement
    likes_count INTEGER DEFAULT 0,
    -- Status
    is_deleted BOOLEAN DEFAULT false,
    deleted_by UUID,
    deleted_at TIMESTAMPTZ,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_forum_comments_thread ON public.forum_comments(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_author ON public.forum_comments(author_id);
-- ============================================================================
-- 4. FORUM LIKES (Threads & Comments)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.forum_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- What is being liked
    target_type VARCHAR(20) NOT NULL,
    -- 'thread' or 'comment'
    target_id UUID NOT NULL,
    -- Who liked it
    user_id UUID NOT NULL,
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Prevent duplicate likes
    UNIQUE(user_id, target_type, target_id)
);
CREATE INDEX IF NOT EXISTS idx_forum_likes_target ON public.forum_likes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_user ON public.forum_likes(user_id);
-- ============================================================================
-- 5. FUNCTION: Create Thread (with Points)
-- ============================================================================
CREATE OR REPLACE FUNCTION create_forum_thread(
        p_author_id UUID,
        p_category_id UUID,
        p_title VARCHAR,
        p_content TEXT
    ) RETURNS UUID AS $$
DECLARE v_thread_id UUID;
v_slug VARCHAR;
BEGIN -- Generate slug
v_slug := LOWER(
    REGEXP_REPLACE(p_title, '[^a-zA-Z0-9]+', '-', 'g')
);
v_slug := SUBSTRING(v_slug, 1, 200) || '-' || EXTRACT(
    EPOCH
    FROM NOW()
)::INTEGER;
-- Create thread
INSERT INTO public.forum_threads (
        author_id,
        category_id,
        title,
        slug,
        content,
        last_activity_at
    )
VALUES (
        p_author_id,
        p_category_id,
        p_title,
        v_slug,
        p_content,
        NOW()
    )
RETURNING id INTO v_thread_id;
-- Award points (15 points for creating thread)
PERFORM award_points(
    p_author_id,
    15,
    'forum_thread',
    'Created thread: ' || p_title,
    jsonb_build_object('thread_id', v_thread_id)
);
RETURN v_thread_id;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 6. FUNCTION: Create Comment (with Points)
-- ============================================================================
CREATE OR REPLACE FUNCTION create_forum_comment(
        p_author_id UUID,
        p_thread_id UUID,
        p_content TEXT
    ) RETURNS UUID AS $$
DECLARE v_comment_id UUID;
BEGIN -- Create comment
INSERT INTO public.forum_comments (
        thread_id,
        author_id,
        content
    )
VALUES (
        p_thread_id,
        p_author_id,
        p_content
    )
RETURNING id INTO v_comment_id;
-- Update thread counts and activity
UPDATE public.forum_threads
SET comments_count = comments_count + 1,
    last_activity_at = NOW()
WHERE id = p_thread_id;
-- Award points (5 points for commenting)
PERFORM award_points(
    p_author_id,
    5,
    'forum_comment',
    'Commented on thread',
    jsonb_build_object(
        'thread_id',
        p_thread_id,
        'comment_id',
        v_comment_id
    )
);
RETURN v_comment_id;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 7. FUNCTION: Toggle Like
-- ============================================================================
CREATE OR REPLACE FUNCTION toggle_forum_like(
        p_user_id UUID,
        p_target_type VARCHAR,
        p_target_id UUID
    ) RETURNS BOOLEAN AS $$
DECLARE v_exists BOOLEAN;
v_is_liked BOOLEAN;
BEGIN -- Check if already liked
SELECT EXISTS(
        SELECT 1
        FROM public.forum_likes
        WHERE user_id = p_user_id
            AND target_type = p_target_type
            AND target_id = p_target_id
    ) INTO v_exists;
IF v_exists THEN -- Unlike
DELETE FROM public.forum_likes
WHERE user_id = p_user_id
    AND target_type = p_target_type
    AND target_id = p_target_id;
-- Update count
IF p_target_type = 'thread' THEN
UPDATE public.forum_threads
SET likes_count = likes_count - 1
WHERE id = p_target_id;
ELSE
UPDATE public.forum_comments
SET likes_count = likes_count - 1
WHERE id = p_target_id;
END IF;
v_is_liked := false;
ELSE -- Like
INSERT INTO public.forum_likes (user_id, target_type, target_id)
VALUES (p_user_id, p_target_type, p_target_id);
-- Update count
IF p_target_type = 'thread' THEN
UPDATE public.forum_threads
SET likes_count = likes_count + 1
WHERE id = p_target_id;
ELSE
UPDATE public.forum_comments
SET likes_count = likes_count + 1
WHERE id = p_target_id;
END IF;
v_is_liked := true;
END IF;
RETURN v_is_liked;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 8. RLS POLICIES
-- ============================================================================
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON public.forum_categories FOR
SELECT USING (is_active = true);
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Threads are viewable by everyone" ON public.forum_threads FOR
SELECT USING (is_deleted = false);
CREATE POLICY "Users can create threads" ON public.forum_threads FOR
INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own threads" ON public.forum_threads FOR
UPDATE USING (auth.uid() = author_id);
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable by everyone" ON public.forum_comments FOR
SELECT USING (is_deleted = false);
CREATE POLICY "Users can create comments" ON public.forum_comments FOR
INSERT WITH CHECK (auth.uid() = author_id);
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes are viewable by everyone" ON public.forum_likes FOR
SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON public.forum_likes FOR ALL USING (auth.uid() = user_id);
-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Seller Forum created successfully!';
RAISE NOTICE '💬 Thread & comment system ready';
RAISE NOTICE '👍 Like/upvote functionality enabled';
RAISE NOTICE '🎮 Points integration complete';
RAISE NOTICE '🎉 Community engagement ready!';
END $$;