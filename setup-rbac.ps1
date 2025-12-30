# Role-Based Access Control (RBAC) System Setup (PowerShell)

Write-Host "Initializing RBAC System..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Database Schema
Write-Host "1. Generating SQL Schema: rbac_schema.sql" -ForegroundColor Yellow

$schemaContent = @'
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
'@

$schemaContent | Set-Content -Path "rbac_schema.sql" -Encoding UTF8
Write-Host "   [?] Schema created." -ForegroundColor Green

# 2. RBAC Hook
Write-Host "2. Creating Hook: src/hooks/usePermission.ts" -ForegroundColor Yellow
$dirHooks = "src\hooks"
if (!(Test-Path $dirHooks)) { New-Item -ItemType Directory -Force -Path $dirHooks | Out-Null }

$hookContent = @'
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
'@

$hookContent | Set-Content -Path "src\hooks\usePermission.ts" -Encoding UTF8
Write-Host "   [?] Hook created." -ForegroundColor Green

# 3. Protect Component
Write-Host "3. Creating Component: src/components/auth/Protect.tsx" -ForegroundColor Yellow
$dirAuth = "src\components\auth"
if (!(Test-Path $dirAuth)) { New-Item -ItemType Directory -Force -Path $dirAuth | Out-Null }

$protectContent = @'
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
'@

$protectContent | Set-Content -Path "src\components\auth\Protect.tsx" -Encoding UTF8
Write-Host "   [?] Protect Wrapper created." -ForegroundColor Green

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "RBAC Setup Complete!" -ForegroundColor Green
Write-Host "1. Run 'rbac_schema.sql' in Supabase." -ForegroundColor White
Write-Host "2. Assign roles to users via Supabase Dashboard (insert into 'user_roles')." -ForegroundColor White
Write-Host "3. Wrap sensitive UI elements:" -ForegroundColor White
Write-Host "   <Protect permission='can_refund'><RefundButton /></Protect>" -ForegroundColor Gray
