-- =============================================================================
-- INVOICE SYSTEM
-- Phase 441-445: Administrative Automation
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =============================================================================
-- 1. INVOICES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Owner
    user_id UUID NOT NULL,
    -- Reference
    order_id UUID,
    -- Invoice details
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    -- Customer
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    customer_address TEXT,
    -- Amounts
    subtotal DECIMAL(12, 2) DEFAULT 0,
    shipping DECIMAL(12, 2) DEFAULT 0,
    discount DECIMAL(12, 2) DEFAULT 0,
    tax DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    -- Items (JSONB for flexibility)
    items JSONB,
    -- Payment
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'unpaid',
    -- 'unpaid', 'paid', 'partial'
    paid_at TIMESTAMPTZ,
    -- PDF
    pdf_url TEXT,
    -- Status
    status VARCHAR(20) DEFAULT 'created',
    -- 'created', 'sent', 'paid', 'cancelled'
    -- Delivery
    sent_via VARCHAR(20),
    -- 'whatsapp', 'email', 'both'
    sent_at TIMESTAMPTZ,
    -- Notes
    notes TEXT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices(created_at DESC);
-- =============================================================================
-- 2. INVOICE SETTINGS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.invoice_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- User
    user_id UUID NOT NULL UNIQUE,
    -- Business info for invoice
    business_name VARCHAR(255),
    business_address TEXT,
    business_phone VARCHAR(20),
    business_email VARCHAR(255),
    -- Branding
    logo_url TEXT,
    signature_url TEXT,
    stamp_url TEXT,
    -- Bank info
    bank_name VARCHAR(100),
    bank_account VARCHAR(50),
    bank_account_name VARCHAR(100),
    -- Defaults
    default_notes TEXT,
    invoice_prefix VARCHAR(20) DEFAULT 'INV',
    -- Tax
    include_tax BOOLEAN DEFAULT false,
    tax_rate DECIMAL(5, 2) DEFAULT 11.00,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- =============================================================================
-- 3. RLS POLICIES
-- =============================================================================
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own invoices" ON public.invoices FOR ALL USING (auth.uid() = user_id);
ALTER TABLE public.invoice_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own invoice settings" ON public.invoice_settings FOR ALL USING (auth.uid() = user_id);
-- =============================================================================
-- COMPLETION
-- =============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Invoice System created!';
RAISE NOTICE '📄 PDF invoice generation ready';
RAISE NOTICE '💼 Professional templates';
RAISE NOTICE '📱 WA/Email delivery';
END $$;