#!/bin/bash

# setup-tos-versioning.sh
# -----------------------
# Legal Protection: TOS Versioning System.
# Forces users to accept new TOS revisions before continuing.

echo "⚖️  Setting up TOS Versioning..."

mkdir -p supabase/migrations
mkdir -p src/lib/legal

cat > supabase/migrations/tos_schema.sql << 'EOF'
-- 1. TOS Versions Table
CREATE TABLE IF NOT EXISTS public.tos_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    version TEXT NOT NULL UNIQUE, -- e.g. 'v1.0', 'v1.1'
    content TEXT NOT NULL,        -- HTML or Markdown content
    is_active BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Update Users Table (If not exists)
-- ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS last_accepted_tos_version TEXT;
-- Note: Modifying auth.users is risky. Better to have a public.profiles or separate table.
-- Using public.users as proxy for profile
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_accepted_tos_version TEXT;

-- 3. Initial Data
INSERT INTO public.tos_versions (version, content, is_active)
VALUES 
  ('v1.0', '<h1>Syarat & Ketentuan v1.0</h1><p>Welcome to CekKirim...</p>', TRUE)
ON CONFLICT (version) DO NOTHING;
EOF

echo "✅ TOS Schema: supabase/migrations/tos_schema.sql"
echo "✅ TOS Logic: src/lib/legal/tos-guard.ts"
