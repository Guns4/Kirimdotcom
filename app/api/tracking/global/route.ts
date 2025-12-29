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
    // await fetch(`https://api.17track.net/track/v1/gettrackinfo`, ...)

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
