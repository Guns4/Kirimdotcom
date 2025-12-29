#!/bin/bash

# =============================================================================
# Role-Based Access Control (RBAC) System Setup
# =============================================================================

echo "Initializing RBAC System..."
echo "================================================="

# 1. Database Schema
echo "1. Generating SQL Schema: rbac_schema.sql"
cat <<EOF > rbac_schema.sql
-- 1. Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text UNIQUE NOT NULL, -- e.g. 'admin_gudang', 'finance', 'cs'
    description text
);

-- 2. Permissions Table
CREATE TABLE IF NOT EXISTS public.permissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text UNIQUE NOT NULL, -- e.g. 'can_refund', 'can_view_profit'
    description text
);

-- 3. Role <-> Permissions (Huge flexibility)
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id uuid REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. User <-> Roles (Users can have multiple roles)
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Data Seeding: Default Roles & Logic
INSERT INTO public.roles (name, description) VALUES
    ('admin_gudang', 'Warehouse Manager'),
    ('finance', 'Financial Officer'),
    ('cs', 'Customer Service Representative')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.permissions (code, description) VALUES
    ('can_refund', 'Process refunds for transactions'),
    ('can_view_profit', 'View financial reports and profit margins'),
    ('can_manage_stock', 'Update inventory levels'),
    ('can_view_users', 'View customer list')
ON CONFLICT (code) DO NOTHING;

-- Map Sample Permissions
-- Finance -> Refund, Profit
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p 
WHERE r.name = 'finance' AND p.code IN ('can_refund', 'can_view_profit')
ON CONFLICT DO NOTHING;

-- CS -> View Users
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p 
WHERE r.name = 'cs' AND p.code IN ('can_view_users')
ON CONFLICT DO NOTHING;

-- Gudang -> Manage Stock
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p 
WHERE r.name = 'admin_gudang' AND p.code IN ('can_manage_stock')
ON CONFLICT DO NOTHING;

-- Helper View for Efficient Lookup
CREATE OR REPLACE VIEW public.user_permissions_view AS
SELECT DISTINCT nr.user_id, p.code
FROM public.user_roles nr
JOIN public.role_permissions rp ON nr.role_id = rp.role_id
JOIN public.permissions p ON rp.permission_id = p.id;

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
EOF
echo "   [?] Schema created."

# 2. RBAC Hook
echo "2. Creating Hook: src/hooks/usePermission.ts"
mkdir -p src/hooks

cat <<EOF > src/hooks/usePermission.ts
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export function usePermission(requiredPermission: string) {
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function check() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            // Efficient query using the View created in SQL
            // or perform a join query if view access is restricted.
            // For safety/RLS reasons, usually better to perform an RPC or just query the tables.
            
            // Query: Does this user have a role that has this permission?
            const { data, error } = await supabase
                .from('user_permissions_view')
                .select('code')
                .eq('user_id', user.id)
                .eq('code', requiredPermission)
                .single();

            if (data && !error) {
                setHasPermission(true);
            }
            setLoading(false);
        }

        check();
    }, [requiredPermission]);

    return { hasPermission, loading };
}
EOF
echo "   [?] Hook created."

# 3. Protect Component
echo "3. Creating Component: src/components/auth/Protect.tsx"
mkdir -p src/components/auth

cat <<EOF > src/components/auth/Protect.tsx
'use client';

import { usePermission } from '@/hooks/usePermission';

interface ProtectProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function Protect({ permission, children, fallback = null }: ProtectProps) {
    const { hasPermission, loading } = usePermission(permission);

    if (loading) return null; // Or a skeleton

    if (hasPermission) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}
EOF
echo "   [?] Protect Wrapper created."

echo ""
echo "================================================="
echo "RBAC Setup Complete!"
echo "1. Run 'rbac_schema.sql' in Supabase."
echo "2. Assign roles to users via Supabase Dashboard (insert into 'user_roles')."
echo "3. Wrap sensitive UI elements:"
echo "   <Protect permission='can_refund'><RefundButton /></Protect>"
