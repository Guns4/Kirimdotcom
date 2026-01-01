-- ============================================
-- GOD MODE PHASE 1801-1900: KNOWLEDGE & LEGAL
-- Legal Docs Versioning, API Docs, FAQ
-- ============================================
-- LEGAL DOCUMENTS TABLE (Version Control)
CREATE TABLE IF NOT EXISTS public.legal_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(100) NOT NULL,
    -- 'terms-of-service', 'privacy-policy', etc.
    title VARCHAR(255) NOT NULL,
    content_html TEXT NOT NULL,
    version_number VARCHAR(20) NOT NULL,
    -- '1.0', '1.1', '2.0'
    effective_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    changelog_summary TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(slug, version_number)
);
-- API DOCUMENTATION CONFIG TABLE
CREATE TABLE IF NOT EXISTS public.api_docs_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    endpoint_path VARCHAR(255) UNIQUE NOT NULL,
    method VARCHAR(10) CHECK (
        method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')
    ),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    request_example JSONB,
    response_example JSONB,
    is_public BOOLEAN DEFAULT true,
    is_deprecated BOOLEAN DEFAULT false,
    category VARCHAR(50),
    -- 'Shipping', 'Marketplace', 'Payment', etc.
    requires_auth BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- KNOWLEDGE FAQ TABLE
CREATE TABLE IF NOT EXISTS public.knowledge_faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(50) CHECK (
        category IN (
            'BILLING',
            'TECH',
            'SHIPPING',
            'ACCOUNT',
            'GENERAL'
        )
    ),
    tags TEXT [],
    -- Array of searchable tags
    helpful_count INT DEFAULT 0,
    not_helpful_count INT DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_legal_docs_slug ON public.legal_documents(slug);
CREATE INDEX IF NOT EXISTS idx_legal_docs_active ON public.legal_documents(is_active);
CREATE INDEX IF NOT EXISTS idx_api_docs_public ON public.api_docs_config(is_public);
CREATE INDEX IF NOT EXISTS idx_api_docs_category ON public.api_docs_config(category);
CREATE INDEX IF NOT EXISTS idx_faq_category ON public.knowledge_faqs(category);
CREATE INDEX IF NOT EXISTS idx_faq_published ON public.knowledge_faqs(is_published);
-- Row Level Security
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_docs_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_faqs ENABLE ROW LEVEL SECURITY;
-- Policies (Public read for active legal docs)
DROP POLICY IF EXISTS "Anyone can view active legal docs" ON public.legal_documents;
CREATE POLICY "Anyone can view active legal docs" ON public.legal_documents FOR
SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Anyone can view public API docs" ON public.api_docs_config;
CREATE POLICY "Anyone can view public API docs" ON public.api_docs_config FOR
SELECT USING (
        is_public = true
        AND is_deprecated = false
    );
DROP POLICY IF EXISTS "Anyone can view published FAQs" ON public.knowledge_faqs;
CREATE POLICY "Anyone can view published FAQs" ON public.knowledge_faqs FOR
SELECT USING (is_published = true);
-- Function to activate new legal version
CREATE OR REPLACE FUNCTION activate_legal_version(p_id UUID) RETURNS void AS $$
DECLARE v_slug VARCHAR;
BEGIN -- Get slug of document being activated
SELECT slug INTO v_slug
FROM public.legal_documents
WHERE id = p_id;
-- Deactivate all other versions of same slug
UPDATE public.legal_documents
SET is_active = false
WHERE slug = v_slug
    AND id != p_id;
-- Activate new version
UPDATE public.legal_documents
SET is_active = true
WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;
-- Seed sample legal documents
INSERT INTO public.legal_documents (
        slug,
        title,
        content_html,
        version_number,
        effective_date,
        is_active,
        changelog_summary
    )
VALUES (
        'terms-of-service',
        'Terms of Service',
        '<h1>Terms of Service</h1><p>Welcome to CekKirim...</p>',
        '1.0',
        CURRENT_DATE,
        true,
        'Initial version'
    ),
    (
        'privacy-policy',
        'Privacy Policy',
        '<h1>Privacy Policy</h1><p>We respect your privacy...</p>',
        '1.0',
        CURRENT_DATE,
        true,
        'Initial version'
    ),
    (
        'refund-policy',
        'Refund Policy',
        '<h1>Refund Policy</h1><p>Refunds are processed...</p>',
        '1.0',
        CURRENT_DATE,
        true,
        'Initial version'
    ) ON CONFLICT DO NOTHING;
-- Seed sample API docs
INSERT INTO public.api_docs_config (
        endpoint_path,
        method,
        title,
        description,
        category,
        is_public
    )
VALUES (
        '/api/v1/check-ongkir',
        'POST',
        'Check Shipping Cost',
        'Calculate shipping cost between locations',
        'Shipping',
        true
    ),
    (
        '/api/v1/tracking',
        'GET',
        'Track Shipment',
        'Get real-time tracking for shipment',
        'Shipping',
        true
    ),
    (
        '/api/v1/marketplace/products',
        'GET',
        'List Products',
        'Get marketplace products',
        'Marketplace',
        true
    ) ON CONFLICT DO NOTHING;
-- Seed sample FAQs
INSERT INTO public.knowledge_faqs (question, answer, category, tags, display_order)
VALUES (
        'Bagaimana cara topup saldo?',
        'Anda bisa topup melalui menu Wallet > Topup. Pilih nominal dan metode pembayaran.',
        'BILLING',
        ARRAY ['topup', 'saldo', 'pembayaran'],
        1
    ),
    (
        'Berapa lama proses pengiriman?',
        'Estimasi pengiriman 1-3 hari kerja untuk dalam kota, 3-7 hari untuk luar kota.',
        'SHIPPING',
        ARRAY ['pengiriman', 'estimasi'],
        2
    ),
    (
        'Apakah bisa refund jika paket rusak?',
        'Ya, silakan hubungi CS maksimal 3 hari setelah paket diterima dengan bukti foto.',
        'SHIPPING',
        ARRAY ['refund', 'rusak', 'klaim'],
        3
    ) ON CONFLICT DO NOTHING;
COMMENT ON TABLE public.legal_documents IS 'Legal documents with version control for compliance';
COMMENT ON TABLE public.api_docs_config IS 'API documentation configuration and visibility control';
COMMENT ON TABLE public.knowledge_faqs IS 'Frequently asked questions knowledge base';