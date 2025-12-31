import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function DELETE(req: NextRequest) {
    // Fix: Double await for createClient stability
    const supabasePromise = await createClient();
    const supabase = await supabasePromise;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Call Soft Delete RPC
        const { error: rpcError } = await supabase.rpc('soft_delete_user');
        if (rpcError) throw rpcError;

        // 2. Sign Out
        await supabase.auth.signOut();

        return NextResponse.json({ success: true, message: 'Account deleted successfully' });
    } catch (error: any) {
        console.error('Delete User Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
