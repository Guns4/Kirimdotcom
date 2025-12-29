#!/bin/bash

# =============================================================================
# User Experience: Global Tracking
# =============================================================================

echo "Initializing Global Tracking System..."
echo "================================================="

# 1. API for Global Tracking
echo "1. Creating API: app/api/tracking/global/route.ts"
mkdir -p app/api/tracking/global
cat <<EOF > app/api/tracking/global/route.ts
import { NextResponse } from 'next/server';

// Mock Translation Service
function translateStatus(text: string): string {
    const dictionary: Record<string, string> = {
        'In Transit': 'Dalam Perjalanan',
        'Arrived at Destination': 'Tiba di Negara Tujuan',
        'Customs Clearance': 'Proses Bea Cukai',
        // Mock Chinese
        '包裹正在等待揽收': 'Paket sedang menunggu penjemputan',
        '离开处理中心': 'Meninggalkan pusat pemrosesan'
    };
    return dictionary[text] || text;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const awb = searchParams.get('awb');

    if (!awb) {
        return NextResponse.json({ error: 'AWB Required' }, { status: 400 });
    }

    // 1. Regex Validation (UPU Standard: XX123456789YY)
    const upuRegex = /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/;
    if (!upuRegex.test(awb)) {
        return NextResponse.json({ error: 'Invalid International AWB Format' }, { status: 400 });
    }

    // 2. Mock 3rd Party API Call (17Track / AfterShip)
    // await fetch(\`https://api.17track.net/track/v1/gettrackinfo\`, ...)
    
    // SIMULATED RESPONSE
    const mockHistory = [
        { date: '2025-12-01 10:00', location: 'Guangzhou, CN', desc: '离开处理中心' },
        { date: '2025-12-03 14:00', location: 'Jakarta, ID', desc: 'Arrived at Destination' },
        { date: '2025-12-04 09:00', location: 'Jakarta, ID', desc: 'Customs Clearance' }
    ];

    // 3. Process & Translate
    const history = mockHistory.map(event => ({
        ...event,
        desc_original: event.desc,
        desc_translated: translateStatus(event.desc)
    }));

    return NextResponse.json({
        awb,
        courier: 'Global Standard (UPU)',
        origin: 'CN',
        destination: 'ID', 
        history
    });
}
EOF

# 2. Frontend Utils (Detection)
echo "2. Creating Logic: lib/tracking-utils.ts"
mkdir -p lib
cat <<EOF > lib/tracking-utils.ts
export function isInternationalAWB(awb: string): boolean {
    // Matches Standard International Format (e.g. LP000000000CN, UX123456789SG)
    return /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/.test(awb);
}

export function getTrackingEndpoint(awb: string): string {
    if (isInternationalAWB(awb)) {
        return '/api/tracking/global';
    }
    return '/api/tracking'; // Local Default
}
EOF

echo ""
echo "================================================="
echo "Global Tracking Ready!"
echo "1. API: GET /api/tracking/global?awb=LP123456789CN"
echo "2. Utils: Use 'isInternationalAWB' in your Search Bar UI."
