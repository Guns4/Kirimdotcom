-- SaaS Billing Schema
-- Plans, Subscriptions, and Invoices

-- Plans Configuration
CREATE TABLE IF NOT EXISTS saas_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- BASIC, PRO, ENTERPRISE
    price DECIMAL(10,2) NOT NULL,
    max_domains INT DEFAULT 1,
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS saas_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES saas_tenants(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES saas_plans(id),
    
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, CANCELLED, PAST_DUE
    auto_renew BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS saas_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES saas_subscriptions(id),
    tenant_id UUID REFERENCES saas_tenants(id),
    
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'IDR',
    
    status TEXT DEFAULT 'UNPAID', -- UNPAID, PAID, VOID
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    invoice_number TEXT UNIQUE,
    pdf_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE saas_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read plans" ON saas_plans FOR SELECT USING (true);
CREATE POLICY "Tenants view own sub" ON saas_subscriptions FOR SELECT USING (auth.uid() = (SELECT user_id FROM saas_tenants WHERE id = tenant_id));
CREATE POLICY "Tenants view own invoices" ON saas_invoices FOR SELECT USING (auth.uid() = (SELECT user_id FROM saas_tenants WHERE id = tenant_id));

-- Seed Default Plans
INSERT INTO saas_plans (name, price, max_domains) VALUES
('BASIC', 150000, 1),
('PRO', 500000, 5),
('ENTERPRISE', 2000000, 9999)
ON CONFLICT (name) DO NOTHING;
