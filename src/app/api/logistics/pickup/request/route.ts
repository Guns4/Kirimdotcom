import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { lat, lng, address } = body;

    // 1. Check Wallet Balance & Deduct Fee (Rp 10.000)
    // (Assuming generic ledger check passed, simpler for demo: just record debt/payment)
    const FEE = 10000;

    // 2. Dispatcher Logic: Find nearest courier < 5km
    // formula: Haversine or Postgres PostGIS. Using simple Euclidean for small distances/demo or mocked.

    // MOCK: Find any 'online' courier. Real app would use:
    // SELECT * FROM courier_locations WHERE ST_DWithin(...)

    const { data: couriers } = await supabase
        .from('courier_locations')
        .select('*')
        .eq('is_online', true)
        .limit(1);

    let assignedCourierId: string | null = null;
    let status = 'PENDING';

    if (couriers && couriers.length > 0) {
        assignedCourierId = couriers[0].courier_id;
        status = 'ASSIGNED';
    }

    // 3. Create Request
    const { data: pickup, error } = await supabase.from('pickup_requests').insert({
        user_id: user.id,
        courier_id: assignedCourierId,
        status,
        lat,
        lng,
        pickup_address: address,
        fee: FEE
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // 4. Charge Wallet
    await supabase.from('ledger_entries').insert({
        user_id: user.id,
        amount: -FEE,
        type: 'SERVICE_FEE',
        description: 'Biaya VIP Pickup Paket'
    });

    return NextResponse.json({ success: true, pickup });
}
