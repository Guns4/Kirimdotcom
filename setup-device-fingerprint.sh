#!/bin/bash

# setup-device-fingerprint.sh
# ---------------------------
# Setup Device Fingerprinting & Geo-Location Guard
# Includes Impossible Travel Detection

echo "🕵️  Setting up Enhanced Fraud Detection..."

# 1. Update Database Schema
mkdir -p supabase/security

cat > supabase/security/device_fingerprint_enhanced.sql << 'EOF'
-- Ensure table exists (from previous step)
CREATE TABLE IF NOT EXISTS public.known_devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_hash TEXT NOT NULL,
    user_agent TEXT,
    ip_address TEXT,
    latitude FLOAT,   -- NEW
    longitude FLOAT,  -- NEW
    country_code TEXT, -- NEW
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_trusted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_known_devices_user_hash ON public.known_devices(user_id, device_hash);

-- RLS
ALTER TABLE public.known_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own devices" ON public.known_devices FOR SELECT USING (auth.uid() = user_id);
-- Insert handled by server function/policy
EOF

# 2. Logic Implementation
mkdir -p src/lib/security

cat > src/lib/security/geo-guard.ts << 'EOF'
// Haversine Formula for Distance Calculation
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}

/**
 * IMPOSSIBLE TRAVEL CHECK
 * Checks if the user moved too fast between two logins.
 * E.g. Indonesia -> Russia in 5 minutes.
 */
export function isImpossibleTravel(
    prevLat: number, prevLon: number, prevTime: Date,
    newLat: number, newLon: number, newTime: Date
): boolean {
    const distanceKm = getDistanceFromLatLonInKm(prevLat, prevLon, newLat, newLon);
    const timeDiffHours = (newTime.getTime() - prevTime.getTime()) / (1000 * 60 * 60);

    // If time difference is very small (e.g. almost instant), check distance
    if (timeDiffHours < 0.1) return distanceKm > 100; // > 100km in < 6 mins is suspicious

    const speed = distanceKm / timeDiffHours; // km/h

    // Commercial plane speed ~900 km/h. Giving buffer of 1200 km/h
    const MAX_SPEED = 1200;

    if (distanceKm > 50 && speed > MAX_SPEED) {
        console.warn(`[FRAUD] Impossible Travel Detected! ${distanceKm}km in ${timeDiffHours}h. Speed: ${speed}`);
        return true;
    }
    return false;
}
EOF

echo "✅ Enhanced Fingerprint SQL: supabase/security/device_fingerprint_enhanced.sql"
echo "✅ Geo Logic: src/lib/security/geo-guard.ts"
