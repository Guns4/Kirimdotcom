#!/bin/bash

# setup-idempotency.sh
# --------------------
# Prevents Double Spending using Redis Cache Lock

echo "🔒 Setting up Idempotency System..."

# 1. Install Upstash/Redis (Already installed in previous task, but ensuring)
# npm install @vercel/kv

mkdir -p src/lib/security

cat > src/lib/security/idempotency.ts << 'EOF'
import { kv } from '@vercel/kv';

export async function checkIdempotency(key: string, expirySeconds = 10): Promise<boolean> {
  // If no key provided (e.g. GET request), skip
  if (!key) return true;

  const lockKey = `idempotency:${key}`;
  
  // Try to set the key ONLY if it doesn't exist (NX)
  // And auto-expire it (EX)
  // Returns 'OK' if set, null if already exists
  const result = await kv.set(lockKey, 'processing', { nx: true, ex: expirySeconds });

  if (!result) {
    console.warn(`[IDEMPOTENCY] Duplicate Request Blocked: ${key}`);
    return false; // Request is Duplicate
  }

  return true; // Request is Fresh
}

export async function clearIdempotency(key: string) {
    if (!key) return;
    await kv.del(`idempotency:${key}`);
}
EOF

echo "✅ Idempotency Logic created at src/lib/security/idempotency.ts"
echo "👉 Usage: if (!await checkIdempotency(headerKey)) return Error('Too Many Requests');"
