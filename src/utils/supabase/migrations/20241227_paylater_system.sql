-- ============================================================================
-- PAYLATER SYSTEM - DOUBLE ENTRY BOOKKEEPING
-- Phase 201-205: Advance Payment for Shipping Costs
-- ============================================================================
-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- ============================================================================
-- 1. PAYLATER ACCOUNTS TABLE (Chart of Accounts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.paylater_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Account identification
    account_code VARCHAR(50) UNIQUE NOT NULL,
    -- e.g., 'ASSET-001', 'LIABILITY-001'
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    -- 'asset', 'liability', 'equity', 'revenue', 'expense'
    -- Account classification
    category VARCHAR(100),
    -- e.g., 'Receivables', 'Payables', 'Cash'
    subcategory VARCHAR(100),
    -- Balance tracking (for quick lookups)
    current_balance DECIMAL(15, 2) DEFAULT 0.00,
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_system_account BOOLEAN DEFAULT false,
    -- System accounts can't be deleted
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_paylater_accounts_code ON public.paylater_accounts(account_code);
CREATE INDEX IF NOT EXISTS idx_paylater_accounts_type ON public.paylater_accounts(account_type);
-- ============================================================================
-- 2. PAYLATER SELLER CREDIT TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.paylater_seller_credit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Seller info
    user_id UUID NOT NULL UNIQUE,
    -- One credit account per seller
    -- Credit limits
    credit_limit DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    available_credit DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    used_credit DECIMAL(12, 2) GENERATED ALWAYS AS (credit_limit - available_credit) STORED,
    -- Credit score (will be populated by Phase 2: Credit Scoring)
    credit_score INTEGER DEFAULT 0,
    -- 0-850 scale
    risk_category VARCHAR(20) DEFAULT 'unrated',
    -- 'low', 'medium', 'high', 'unrated'
    -- Terms
    grace_period_days INTEGER DEFAULT 7,
    interest_rate DECIMAL(5, 2) DEFAULT 0.00,
    -- Percentage per month
    late_fee_percentage DECIMAL(5, 2) DEFAULT 2.00,
    -- Status
    is_approved BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_frozen BOOLEAN DEFAULT false,
    -- Freeze if payment overdue
    -- Statistics
    total_advanced DECIMAL(15, 2) DEFAULT 0.00,
    total_repaid DECIMAL(15, 2) DEFAULT 0.00,
    current_outstanding DECIMAL(15, 2) DEFAULT 0.00,
    overdue_amount DECIMAL(15, 2) DEFAULT 0.00,
    -- Dates
    approved_at TIMESTAMPTZ,
    last_transaction_at TIMESTAMPTZ,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_paylater_seller_user ON public.paylater_seller_credit(user_id);
CREATE INDEX IF NOT EXISTS idx_paylater_seller_approved ON public.paylater_seller_credit(is_approved);
CREATE INDEX IF NOT EXISTS idx_paylater_seller_active ON public.paylater_seller_credit(is_active);
-- ============================================================================
-- 3. PAYLATER LEDGER (Double Entry Bookkeeping)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.paylater_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Transaction reference
    transaction_id UUID NOT NULL,
    -- Links debit/credit entries
    transaction_type VARCHAR(50) NOT NULL,
    -- 'advance', 'repayment', 'interest', 'fee'
    -- Accounting entry
    account_id UUID NOT NULL REFERENCES public.paylater_accounts(id),
    entry_type VARCHAR(10) NOT NULL CHECK (entry_type IN ('debit', 'credit')),
    amount DECIMAL(15, 2) NOT NULL CHECK (amount >= 0),
    -- Related entities
    seller_id UUID,
    -- Link to seller
    order_id UUID,
    -- Link to order if applicable
    -- Description
    description TEXT,
    reference_number VARCHAR(100),
    -- External reference (e.g., invoice number)
    -- Reconciliation
    is_reconciled BOOLEAN DEFAULT false,
    reconciled_at TIMESTAMPTZ,
    -- Metadata
    created_by UUID,
    -- Admin or system user
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_paylater_ledger_transaction ON public.paylater_ledger(transaction_id);
CREATE INDEX IF NOT EXISTS idx_paylater_ledger_account ON public.paylater_ledger(account_id);
CREATE INDEX IF NOT EXISTS idx_paylater_ledger_seller ON public.paylater_ledger(seller_id);
CREATE INDEX IF NOT EXISTS idx_paylater_ledger_date ON public.paylater_ledger(created_at);
-- ============================================================================
-- 4. PAYLATER TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.paylater_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Seller info
    seller_id UUID NOT NULL,
    credit_account_id UUID NOT NULL REFERENCES public.paylater_seller_credit(id),
    -- Transaction details
    transaction_type VARCHAR(50) NOT NULL,
    -- 'advance', 'repayment', 'interest_charge', 'late_fee'
    amount DECIMAL(12, 2) NOT NULL,
    -- Related order (for advances)
    order_id UUID,
    shipping_cost DECIMAL(10, 2),
    -- Payment details (for repayments)
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'approved', 'completed', 'failed', 'cancelled'
    -- Dates
    due_date DATE,
    completed_at TIMESTAMPTZ,
    -- Notes
    notes TEXT,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_paylater_trans_seller ON public.paylater_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_paylater_trans_order ON public.paylater_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_paylater_trans_status ON public.paylater_transactions(status);
CREATE INDEX IF NOT EXISTS idx_paylater_trans_due ON public.paylater_transactions(due_date);
-- ============================================================================
-- 5. PAYLATER SETTLEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.paylater_settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Seller info
    seller_id UUID NOT NULL,
    -- Settlement details
    settlement_period_start DATE NOT NULL,
    settlement_period_end DATE NOT NULL,
    -- Amounts
    total_advances DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_repayments DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    interest_charged DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    fees_charged DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    net_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    -- Can be positive or negative
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'approved', 'paid', 'disputed'
    -- Payment
    payment_method VARCHAR(50),
    paid_at TIMESTAMPTZ,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_paylater_settlements_seller ON public.paylater_settlements(seller_id);
CREATE INDEX IF NOT EXISTS idx_paylater_settlements_period ON public.paylater_settlements(settlement_period_end);
CREATE INDEX IF NOT EXISTS idx_paylater_settlements_status ON public.paylater_settlements(status);
-- ============================================================================
-- 6. SEED DATA: Chart of Accounts
-- ============================================================================
INSERT INTO public.paylater_accounts (
        account_code,
        account_name,
        account_type,
        category,
        is_system_account
    )
VALUES -- Assets
    (
        'CASH-001',
        'Operating Cash',
        'asset',
        'Cash & Cash Equivalents',
        true
    ),
    (
        'AR-SELLER-001',
        'Accounts Receivable - Sellers',
        'asset',
        'Receivables',
        true
    ),
    -- Liabilities
    (
        'AP-COURIERS-001',
        'Accounts Payable - Couriers',
        'liability',
        'Payables',
        true
    ),
    -- Revenue
    (
        'REV-INTEREST-001',
        'Interest Revenue',
        'revenue',
        'Financial Income',
        true
    ),
    (
        'REV-FEES-001',
        'Late Fee Revenue',
        'revenue',
        'Financial Income',
        true
    ),
    -- Expenses
    (
        'EXP-BAD-DEBT-001',
        'Bad Debt Expense',
        'expense',
        'Operating Expenses',
        true
    ) ON CONFLICT (account_code) DO NOTHING;
-- ============================================================================
-- 7. FUNCTIONS: Double Entry Helper
-- ============================================================================
-- Create double entry ledger transaction
CREATE OR REPLACE FUNCTION create_double_entry(
        p_transaction_id UUID,
        p_transaction_type VARCHAR,
        p_debit_account_code VARCHAR,
        p_credit_account_code VARCHAR,
        p_amount DECIMAL,
        p_seller_id UUID DEFAULT NULL,
        p_order_id UUID DEFAULT NULL,
        p_description TEXT DEFAULT NULL
    ) RETURNS VOID AS $$
DECLARE v_debit_account_id UUID;
v_credit_account_id UUID;
BEGIN -- Get account IDs
SELECT id INTO v_debit_account_id
FROM public.paylater_accounts
WHERE account_code = p_debit_account_code;
SELECT id INTO v_credit_account_id
FROM public.paylater_accounts
WHERE account_code = p_credit_account_code;
IF v_debit_account_id IS NULL
OR v_credit_account_id IS NULL THEN RAISE EXCEPTION 'Invalid account codes';
END IF;
-- Insert debit entry
INSERT INTO public.paylater_ledger (
        transaction_id,
        transaction_type,
        account_id,
        entry_type,
        amount,
        seller_id,
        order_id,
        description
    )
VALUES (
        p_transaction_id,
        p_transaction_type,
        v_debit_account_id,
        'debit',
        p_amount,
        p_seller_id,
        p_order_id,
        p_description
    );
-- Insert credit entry
INSERT INTO public.paylater_ledger (
        transaction_id,
        transaction_type,
        account_id,
        entry_type,
        amount,
        seller_id,
        order_id,
        description
    )
VALUES (
        p_transaction_id,
        p_transaction_type,
        v_credit_account_id,
        'credit',
        p_amount,
        p_seller_id,
        p_order_id,
        p_description
    );
-- Update account balances
UPDATE public.paylater_accounts
SET current_balance = current_balance + p_amount,
    updated_at = NOW()
WHERE id = v_debit_account_id;
UPDATE public.paylater_accounts
SET current_balance = current_balance - p_amount,
    updated_at = NOW()
WHERE id = v_credit_account_id;
END;
$$ LANGUAGE plpgsql;
-- Process shipping cost advance
CREATE OR REPLACE FUNCTION process_shipping_advance(
        p_seller_id UUID,
        p_order_id UUID,
        p_amount DECIMAL
    ) RETURNS UUID AS $$
DECLARE v_transaction_id UUID;
v_credit_account RECORD;
v_available_credit DECIMAL;
BEGIN v_transaction_id := uuid_generate_v4();
-- Get seller credit account
SELECT * INTO v_credit_account
FROM public.paylater_seller_credit
WHERE user_id = p_seller_id
    AND is_approved = true
    AND is_active = true
    AND is_frozen = false;
IF NOT FOUND THEN RAISE EXCEPTION 'Seller not approved for PayLater';
END IF;
-- Check available credit
IF v_credit_account.available_credit < p_amount THEN RAISE EXCEPTION 'Insufficient credit limit';
END IF;
-- Create transaction record
INSERT INTO public.paylater_transactions (
        id,
        seller_id,
        credit_account_id,
        transaction_type,
        amount,
        order_id,
        status
    )
VALUES (
        v_transaction_id,
        p_seller_id,
        v_credit_account.id,
        'advance',
        p_amount,
        p_order_id,
        'completed'
    );
-- Create double entry
-- Debit: Accounts Receivable (we are owed money)
-- Credit: Cash (we paid courier)
PERFORM create_double_entry(
    v_transaction_id,
    'advance',
    'AR-SELLER-001',
    'CASH-001',
    p_amount,
    p_seller_id,
    p_order_id,
    'Shipping cost advance for order ' || p_order_id::TEXT
);
-- Update seller credit
UPDATE public.paylater_seller_credit
SET available_credit = available_credit - p_amount,
    current_outstanding = current_outstanding + p_amount,
    total_advanced = total_advanced + p_amount,
    last_transaction_at = NOW(),
    updated_at = NOW()
WHERE id = v_credit_account.id;
RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- 8. RLS POLICIES
-- ============================================================================
-- Seller credit: Users can view their own
ALTER TABLE public.paylater_seller_credit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can view their own credit account" ON public.paylater_seller_credit FOR
SELECT USING (auth.uid() = user_id);
-- Transactions: Users can view their own
ALTER TABLE public.paylater_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can view their own transactions" ON public.paylater_transactions FOR
SELECT USING (
        seller_id IN (
            SELECT user_id
            FROM public.paylater_seller_credit
            WHERE user_id = auth.uid()
        )
    );
-- Ledger: Admin only (sensitive accounting data)
ALTER TABLE public.paylater_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can view ledger" ON public.paylater_ledger FOR
SELECT USING (false);
-- Will be updated with admin role check
-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$ BEGIN RAISE NOTICE '✅ PayLater system database schema created successfully!';
RAISE NOTICE '📊 Tables: accounts, seller_credit, ledger, transactions, settlements';
RAISE NOTICE '💰 Double-entry bookkeeping system ready';
RAISE NOTICE '🔐 Functions: create_double_entry, process_shipping_advance';
RAISE NOTICE '🔒 RLS policies enabled for data security';
END $$;