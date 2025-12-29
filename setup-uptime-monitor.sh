#!/bin/bash

# =============================================================================
# Uptime Monitoring & Health Check Setup
# =============================================================================

echo "Initializing Uptime Health Check..."
echo "================================================="

# 1. Health Check Endpoint
echo "1. Creating API Route: src/app/api/health/route.ts"
mkdir -p src/app/api/health

cat <<EOF > src/app/api/health/route.ts
import { createClient } from '@/utils/supabase/client'; // Assuming client or server util exists
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure real-time check

export async function GET() {
  const start = Date.now();
  
  // 1. Basic App Health
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'unknown',
      latency_ms: 0
    }
  };

  try {
    // 2. Database Connection Check
    // We create a fresh client to ensure auth isn't the issue, utilizing public access usually
    // or just checking if we can reach the server.
    const supabase = createClient();
    
    // Simple query: Get current time from DB
    // Note: This requires the client to have some select permission, or use a service role if available/safe.
    // Ideally, just check if we can connect.
    const { data, error } = await supabase.from('tenants').select('count', { count: 'exact', head: true });

    // Alternately, if no public table, use RPC 'select version()' if allowed.
    // Here we assume 'tenants' or 'profiles' exists or just checking connection error.
    
    if (error && error.code !== 'PGRST116') { // Ignore specific 'no rows' if that's the error
         // If generic network error or auth error that implies down
         throw new Error(error.message);
    }
    
    healthData.checks.database = 'healthy';
  } catch (error: any) {
    console.error('Health Check Failed:', error);
    healthData.status = 'error';
    healthData.checks.database = 'unreachable';
    
    return NextResponse.json(healthData, { status: 500 });
  }

  healthData.checks.latency_ms = Date.now() - start;

  return NextResponse.json(healthData, { status: 200 });
}
EOF
echo "   [?] Health route created."

# 2. Setup Guide
echo "2. Generating Guide: UPTIME_MONITOR_GUIDE.md"
cat <<EOF > UPTIME_MONITOR_GUIDE.md
# Uptime Monitoring Setup (UptimeRobot)

## 1. Create Endpoint
Ensure your website is deployed.
Your health check URL is: \`https://your-domain.com/api/health\`

## 2. Configure UptimeRobot (Free)
1. Register at [uptimerobot.com](https://uptimerobot.com/).
2. Click **Add New Monitor**.
3. Settings:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: CekKirim Prod
   - **URL (or IP)**: \`https://cekkirim.com/api/health\`
   - **Monitoring Interval**: 5 minutes (Standard Free Tier)
   - **Alert Contacts**: Select your email.
4. Click **Create Monitor**.

## 3. How it Works
- UptimeRobot will ping your API every 5 minutes.
- Your API tries to connect to Supabase.
- If Supabase is down or the API returns 500, UptimeRobot sends you an email immediately.
EOF

echo ""
echo "================================================="
echo "Setup Complete!"
echo "1. Deploy your app."
echo "2. Follow steps in UPTIME_MONITOR_GUIDE.md."
