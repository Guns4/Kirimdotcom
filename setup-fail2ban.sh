#!/bin/bash

# setup-fail2ban.sh
# -----------------
# Brute Force Protection using Redis
# Blocks IPs after repeated failures

echo "🛡️  Setting up Fail2Ban..."

mkdir -p src/lib/security

cat > src/lib/security/login-guard.ts << 'EOF'
import { kv } from '@vercel/kv';

const MAX_ATTEMPTS = 5;
const BAN_DURATION = 60 * 60; // 1 Hour

export async function checkLoginAttempt(ip: string): Promise<{ allowed: boolean; reason?: string }> {
  const banKey = `ban:${ip}`;
  const failKey = `fail:${ip}`;

  // 1. Check if Banned
  const isBanned = await kv.get(banKey);
  if (isBanned) {
    return { allowed: false, reason: 'IP_BANNED' };
  }

  return { allowed: true };
}

export async function recordLoginFailure(ip: string, email: string) {
  const failKey = `fail:${ip}`;
  const banKey = `ban:${ip}`;

  // Increment failure count
  const attempts = await kv.incr(failKey);
  
  // Set expiry for failure count if new
  if (attempts === 1) {
    await kv.expire(failKey, 300); // 5 Minutes window
  }

  if (attempts >= MAX_ATTEMPTS) {
    console.warn(`[FAIL2BAN] Banning IP ${ip} after ${attempts} failed attempts.`);
    
    // BAN THE IP
    await kv.set(banKey, 'banned', { ex: BAN_DURATION });
    
    // Notify User (Simulated)
    console.log(`📧 Sending Alert Email to ${email}: Someone tried to login from banned IP ${ip}`);
  }
}
EOF

echo "✅ Login Guard created at src/lib/security/login-guard.ts"
