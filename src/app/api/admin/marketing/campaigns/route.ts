import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { data: automations, error } = await supabase
            .from('marketing_automations')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const { data: abTests } = await supabase
            .from('marketing_ab_tests')
            .select('*')
            .order('created_at', { ascending: false });

        return NextResponse.json({
            automations: automations || [],
            ab_tests: abTests || []
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { type, action, id, updates } = body;

        if (type === 'AUTOMATION') {
            if (action === 'TOGGLE') {
                const { error } = await supabase
                    .from('marketing_automations')
                    .update({ is_active: updates.is_active })
                    .eq('id', id);

                if (error) throw error;
            }
        } else if (type === 'AB_TEST') {
            if (action === 'TOGGLE') {
                const { error } = await supabase
                    .from('marketing_ab_tests')
                    .update({ is_active: updates.is_active })
                    .eq('id', id);

                if (error) throw error;
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
