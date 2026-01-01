-- ============================================
-- GOD MODE PHASE 6: SAAS & CMS INTEGRATION
-- Division 4 (SaaS B2B) + Content Management
-- ============================================
-- SAAS API KEYS TABLE (B2B Developer Management)
CREATE TABLE IF NOT EXISTS public.saas_api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    plan VARCHAR(20) DEFAULT 'FREE' CHECK (plan IN ('FREE', 'PRO', 'ENTERPRISE')),
    quota_limit INT DEFAULT 1000,
    quota_used INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    domain_whitelist TEXT [],
    -- Array of allowed domains
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);
-- SAAS USAGE LOGS (Audit Trail)
CREATE TABLE IF NOT EXISTS public.saas_usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    api_key_id UUID REFERENCES public.saas_api_keys(id) ON DELETE CASCADE,
    endpoint VARCHAR(100),
    method VARCHAR(10),
    ip_address VARCHAR(50),
    user_agent TEXT,
    response_status INT,
    response_time_ms INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- CMS CONTENT POSTS (SEO Engine)
CREATE TABLE IF NOT EXISTS public.content_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    category VARCHAR(50),
    is_published BOOLEAN DEFAULT false,
    meta_desc TEXT,
    views INT DEFAULT 0,
    author_id UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    published_at TIMESTAMP WITH TIME ZONE
);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_saas_keys_user ON public.saas_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_saas_keys_key ON public.saas_api_keys(key);
CREATE INDEX IF NOT EXISTS idx_saas_keys_active ON public.saas_api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_saas_usage_key ON public.saas_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_saas_usage_created ON public.saas_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_slug ON public.content_posts(slug);
CREATE INDEX IF NOT EXISTS idx_content_published ON public.content_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_content_category ON public.content_posts(category);
-- Row Level Security
ALTER TABLE public.saas_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;
-- Policies
DROP POLICY IF EXISTS "Users can view own API keys" ON public.saas_api_keys;
CREATE POLICY "Users can view own API keys" ON public.saas_api_keys FOR
SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Public can read published posts" ON public.content_posts;
CREATE POLICY "Public can read published posts" ON public.content_posts FOR
SELECT USING (is_published = true);
-- Function to increment quota
CREATE OR REPLACE FUNCTION increment_saas_quota(p_key VARCHAR) RETURNS void AS $$ BEGIN
UPDATE public.saas_api_keys
SET quota_used = quota_used + 1,
    last_used_at = now()
WHERE key = p_key
    AND is_active = true;
END;
$$ LANGUAGE plpgsql;
-- Function to check quota
CREATE OR REPLACE FUNCTION check_saas_quota(p_key VARCHAR) RETURNS BOOLEAN AS $$
DECLARE v_key RECORD;
BEGIN
SELECT quota_used,
    quota_limit,
    is_active INTO v_key
FROM public.saas_api_keys
WHERE key = p_key;
IF NOT FOUND THEN RETURN false;
END IF;
IF NOT v_key.is_active THEN RETURN false;
END IF;
IF v_key.quota_used >= v_key.quota_limit THEN RETURN false;
END IF;
RETURN true;
END;
$$ LANGUAGE plpgsql;
COMMENT ON TABLE public.saas_api_keys IS 'B2B SaaS API keys for external developers';
COMMENT ON TABLE public.saas_usage_logs IS 'Audit trail for all SaaS API usage';
COMMENT ON TABLE public.content_posts IS 'CMS content for SEO articles and blog posts';