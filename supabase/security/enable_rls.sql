-- 1. Enable RLS on Sensitive Tables
-- (If not already enabled)
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Define Strict Policies

-- USERS Table
DROP POLICY IF EXISTS "Users can only see their own profile" ON public.users;
CREATE POLICY "Users can only see their own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id);

-- WALLETS Table
DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;
CREATE POLICY "Users can view own wallet"
ON public.wallets
FOR SELECT
USING (auth.uid() = user_id);

-- TRANSACTIONS Table
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions"
ON public.transactions
FOR SELECT
USING (auth.uid() = user_id);

-- ORDERS Table
DROP POLICY IF EXISTS "Users can view and manage own orders" ON public.orders;
CREATE POLICY "Users can view and manage own orders"
ON public.orders
FOR ALL
USING (auth.uid() = user_id);

-- 3. Admin Access (Example with role check)
-- Assuming 'admin_users' table or app_metadata check
-- CREATE POLICY "Admins can view all" ON public.users 
-- FOR SELECT USING ( auth.jwt() ->> 'role' = 'service_role' OR EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()) );

-- 4. Audit: Alert on disabled RLS
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND rowsecurity = false
          AND tablename IN ('users', 'wallets', 'transactions', 'orders')
    LOOP
        RAISE WARNING 'RLS is DISABLED on table: %', t;
    END LOOP;
END $$;
