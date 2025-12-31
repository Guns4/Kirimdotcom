import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { MissionEngine } from '@/lib/mission-engine';

export async function GET(req: NextRequest) {
    // Fix: Double await for createClient stability
    const supabasePromise = await createClient();
    const supabase = await supabasePromise;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json([], { status: 401 });

    const missions = await MissionEngine.getDailyMissions(user.id);
    return NextResponse.json(missions);
}
