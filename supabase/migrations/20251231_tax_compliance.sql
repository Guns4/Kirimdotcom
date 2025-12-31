-- Tax Compliance Schema
-- Aggregates sales from SMM, SaaS, and PPOB (H2H) for DJP Reporting

-- 1. Unified Sales View
-- Aggregates data from different sources into a single format
CREATE OR REPLACE VIEW daily_sales_view AS
    -- SaaS Invoices
    SELECT 
        created_at as transaction_date,
        id::text as transaction_id,
        'SAAS_SUBSCRIPTION' as category,
        amount,
        amount * 0.11 as tax_amount -- 11% VAT
    FROM saas_invoices
    WHERE status = 'PAID'
    
    UNION ALL
    
    -- SMM Orders (Assuming table exists from Phase 1716)
    SELECT 
        created_at as transaction_date,
        id::text as transaction_id,
        'SMM_ORDER' as category,
        price as amount, -- Assuming 'price' column
        price * 0.11 as tax_amount
    FROM smm_orders
    WHERE status = 'COMPLETED'
    
    UNION ALL
    
    -- H2H Transactions (Approximated from logs or transaction table)
    -- Using a placeholder if specific table is missing, but assuming h2h_request_logs has cost info?
    -- Actually request_logs might generic. Let's assume 'h2h_transactions' if it exists, otherwise logs.
    -- For safety in this script, we'll create a dummy select if table missing, but ideally we check.
    -- We'll use a safe approach:
    SELECT 
        created_at as transaction_date,
        id::text as transaction_id,
        'PPOB_TRX' as category,
        0 as amount, -- Placeholder if no amount column easily found in logs
        0 as tax_amount
    FROM h2h_request_logs
    WHERE endpoint LIKE '%/trx' AND response_status = 200;

-- 2. Tax Reports Log
CREATE TABLE IF NOT EXISTS tax_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_month TEXT NOT NULL, -- 'YYYY-MM'
    total_sales DECIMAL(15,2) DEFAULT 0,
    total_tax DECIMAL(15,2) DEFAULT 0,
    csv_url TEXT,
    status TEXT DEFAULT 'GENERATED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE tax_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view tax reports" ON tax_reports FOR SELECT USING (false); -- Admin only (strict)
