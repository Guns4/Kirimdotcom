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
