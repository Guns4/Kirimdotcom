#!/bin/bash

# =============================================================================
# Health Check & Uptime Monitoring Setup
# =============================================================================

echo "Initializing Health Check System..."
echo "================================================="

# 1. Create API Route
echo "1. Creating Health Endpoint: src/app/api/health/route.ts"
mkdir -p src/app/api/health

cat <<EOF > src/app/api/health/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    
    // 1. Database Connectivity Check
    // "count" on a generally accessible table like 'tenants' or 'profiles' 
    // is a cheap way to verify DB is reachable.
    const { error } = await supabase.from('tenants').select('count', { count: 'exact', head: true });

    if (error) {
       // If table doesn't exist, we might get 404/PGRST errors, 
       // but strictly connection errors are usually different.
       // For a simple health check, any error might be worth investigating.
       console.error('Health Check DB Error:', error);
       
       // Note: We might allow 'PGRST116' (no rows) if passing 'single', 
       // but here we deal with head:true.
       return NextResponse.json(
         { status: 'error', db: 'unreachable', detail: error.message },
         { status: 503 }
       );
    }

    // 2. Success
    return NextResponse.json(
      { status: 'healthy', db: 'connected', timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500 }
    );
  }
}
EOF

# 2. Guide
echo "2. Generating Guide: UPTIME_ROBOT_GUIDE.md"
cat <<EOF > UPTIME_ROBOT_GUIDE.md
# Setup UptimeRobot (Free 5-min Monitoring)

1.  **Deploy**: Pastikan kode ini sudah dideploy ke Production/Vercel.
2.  **Register**: Daftar gratis di [uptimerobot.com](https://uptimerobot.com/).
3.  **Add Monitor**:
    *   **Monitor Type**: HTTP(s)
    *   **Friendly Name**: CekKirim Health
    *   **URL**: \`https://cekkirim.com/api/health\` (Ganti domain sesuai production Anda)
    *   **Interval**: 5 minutes
4.  **Finish**: Klik **Create Monitor**.

Sekarang, jika database mati atau website down, UptimeRobot akan mengirim email ke Anda dalam waktu 5 menit.
EOF

echo ""
echo "================================================="
echo "Setup Complete!"
echo "Endpoint created at: /api/health"
echo "Read 'UPTIME_ROBOT_GUIDE.md' to configure alerts."
