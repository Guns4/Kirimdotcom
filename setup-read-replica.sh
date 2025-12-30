#!/bin/bash

# =============================================================================
# DevOps: Read Replica Setup
# =============================================================================

echo "Initializing Database Load Balancer..."
echo "================================================="

# 1. Dispatcher Logic
echo "1. Creating DB Dispatcher: src/lib/db-dispatch.ts"
mkdir -p src/lib

cat <<EOF > src/lib/db-dispatch.ts
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';

// 1. PRIMARY CLIENT (Write / Critical Read)
// Uses the standard Server Client (which handles Auth cookies automatically)
export const getPrimaryDB = () => {
    return createServerClient();
};

// 2. REPLICA CLIENT (Read Only - High Volume)
// Uses a direct connection to the Replica URL.
// Note: Replicas usually don't share Auth session state as easily if using Service Role,
// but for public data (tracking, checking prices), we can use the Anon Key.
export const getReplicaDB = () => {
    const replicaUrl = process.env.SUPABASE_URL_REPLICA;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!replicaUrl || !anonKey) {
        console.warn('⚠️ Replica URL not found. Falling back to Primary.');
        return getPrimaryDB();
    }

    return createClient(replicaUrl, anonKey);
};

// 3. Smart Selector
// Usage: const db = await getDB('READ');
export const getDB = async (intent: 'READ' | 'WRITE' = 'WRITE') => {
    if (intent === 'READ' && process.env.SUPABASE_URL_REPLICA) {
        return getReplicaDB();
    }
    return getPrimaryDB();
};
EOF

# 2. Setup Guide
echo "2. Generating Guide: READ_REPLICA_GUIDE.md"
cat <<EOF > READ_REPLICA_GUIDE.md
# Setting up Read Replicas on Supabase

1.  **Enable Add-on**:
    -   Go to Supabase Dashboard > Settings > Infrastructure.
    -   Enable "Read Replicas" (Paid Add-on).
    -   Select region (e.g., Singapore/Jakarta if available).

2.  **Get Replica URL**:
    -   Once deployed, go to Settings > API.
    -   Copy the **Read Replica URL**.

3.  **Update Environment**:
    -   Open \`.env.local\` and \`.env.production\`.
    -   Add: \`SUPABASE_URL_REPLICA=https://your-replica-id.supabase.co\`

4.  **Usage in Code**:
    Instead of:
    \`const supabase = createClient();\`
    
    Use:
    \`import { getDB } from '@/lib/db-dispatch';\`
    \`const supabase = await getDB('READ');\`

    *Use 'READ' for: Tracking, Checking Prices, Analytics.*
    *Use 'WRITE' (detault) for: Payments, Orders, Profile Updates.*
EOF

echo ""
echo "================================================="
echo "Load Balancer Logic Ready!"
echo "1. Configure your .env with SUPABASE_URL_REPLICA."
echo "2. Import 'getDB' from '@/lib/db-dispatch' for heavy queries."
