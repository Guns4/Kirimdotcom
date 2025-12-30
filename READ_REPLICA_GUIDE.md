# Setting up Read Replicas on Supabase

1.  **Enable Add-on**:
    -   Go to Supabase Dashboard > Settings > Infrastructure.
    -   Enable "Read Replicas" (Paid Add-on).
    -   Select region (e.g., Singapore/Jakarta if available).

2.  **Get Replica URL**:
    -   Once deployed, go to Settings > API.
    -   Copy the **Read Replica URL**.

3.  **Update Environment**:
    -   Open `.env.local` and `.env.production`.
    -   Add: `SUPABASE_URL_REPLICA=https://your-replica-id.supabase.co`

4.  **Usage in Code**:
    Instead of:
    `const supabase = createClient();`
    
    Use:
    `import { getDB } from '@/lib/db-dispatch';`
    `const supabase = await getDB('READ');`

    *Use 'READ' for: Tracking, Checking Prices, Analytics.*
    *Use 'WRITE' (detault) for: Payments, Orders, Profile Updates.*
