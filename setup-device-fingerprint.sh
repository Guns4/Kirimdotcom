#!/bin/bash

# setup-device-fingerprint.sh
# ---------------------------
# Setup Device Fingerprinting for Fraud Detection

echo "🕵️  Setting up Device Fingerprinting..."

# 1. Install Library
echo "📦 Installing @fingerprintjs/fingerprintjs..."
npm install @fingerprintjs/fingerprintjs

# 2. Database Schema
mkdir -p supabase/security

cat > supabase/security/device_fingerprint.sql << 'EOF'
-- Table to store valid devices for each user
CREATE TABLE IF NOT EXISTS public.known_devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    device_hash TEXT NOT NULL,
    user_agent TEXT,
    ip_address TEXT,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_trusted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_known_devices_user_hash ON public.known_devices(user_id, device_hash);

-- RLS
ALTER TABLE public.known_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own devices" ON public.known_devices 
    FOR SELECT USING (auth.uid() = user_id);

-- Only server logic should insert/update usually, or strictly validated client input
-- For MVP, we allow insert if user owns it
CREATE POLICY "Users can add devices" ON public.known_devices 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EOF

echo "✅ SQL Schema created: supabase/security/device_fingerprint.sql"

# 3. Validation Logic (Frontend)
mkdir -p src/lib/security

cat > src/lib/security/device-guard.ts << 'EOF'
import { createClient } from '@/utils/supabase/client';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export async function checkDeviceTrust(userId: string): Promise<'TRUSTED' | 'NEW_DEVICE' | 'ERROR'> {
  try {
    // 1. Get Fingerprint
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const deviceHash = result.visitorId;

    const supabase = createClient();

    // 2. Check Database
    const { data } = await supabase
      .from('known_devices')
      .select('id, is_trusted')
      .eq('user_id', userId)
      .eq('device_hash', deviceHash)
      .single();

    if (data) {
      // Update Last Seen
      await supabase.from('known_devices').update({ last_seen: new Date() }).eq('id', data.id);
      return 'TRUSTED';
    } else {
      // New Device Detected!
      // In a real app, do NOT insert immediately. Trigger OTP flow first.
      // For this implementation, we flag it.
      
      console.warn('⚠️ New Device Detected:', deviceHash);
      return 'NEW_DEVICE';
    }
  } catch (e) {
    console.error('Fingerprint check failed', e);
    return 'ERROR';
  }
}

export async function registerDevice(userId: string, deviceHash: string, userAgent: string, ip: string) {
    const supabase = createClient();
    await supabase.from('known_devices').insert({
        user_id: userId,
        device_hash: deviceHash,
        user_agent: userAgent,
        ip_address: ip,
        is_trusted: true // Should be true ONLY after OTP
    });
}
EOF

echo "✅ Device Guard created: src/lib/security/device-guard.ts"
