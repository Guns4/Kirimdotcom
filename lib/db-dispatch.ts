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
