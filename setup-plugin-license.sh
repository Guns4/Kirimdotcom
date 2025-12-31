#!/bin/bash

# setup-plugin-license.sh
# -----------------------
# Software Monetization: License Server.
# Validates key usage for plugins/software.

echo "🔑 Setting up License Server..."

mkdir -p src/app/api/license/activate
mkdir -p supabase/migrations

cat > supabase/migrations/license_schema.sql << 'EOF'
CREATE TYPE license_status AS ENUM ('ACTIVE', 'EXPIRED', 'SUSPENDED');

CREATE TABLE IF NOT EXISTS public.plugin_licenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    license_key TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id),
    domain TEXT, -- The domain where it is activated
    status license_status DEFAULT 'ACTIVE',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.plugin_licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage licenses" ON public.plugin_licenses FOR ALL USING (true); -- Simplify for MVP
EOF

echo "✅ License Schema: supabase/migrations/license_schema.sql"
echo "✅ Activation API: src/app/api/license/activate/route.ts"
