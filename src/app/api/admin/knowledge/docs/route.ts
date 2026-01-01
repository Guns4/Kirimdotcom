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
        const { data: docs, error } = await supabase
            .from('api_docs_config')
            .select('*')
            .order('category', { ascending: true });

        const { data: faqs } = await supabase
            .from('knowledge_faqs')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;

        return NextResponse.json({
            api_docs: docs || [],
            faqs: faqs || []
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
        const { type, action, id, updates, new_item } = body;

        if (type === 'API_DOC') {
            if (action === 'TOGGLE_PUBLIC') {
                await supabase
                    .from('api_docs_config')
                    .update({ is_public: updates.is_public })
                    .eq('id', id);
            }
        } else if (type === 'FAQ') {
            if (action === 'CREATE') {
                await supabase
                    .from('knowledge_faqs')
                    .insert(new_item);
            } else if (action === 'UPDATE') {
                await supabase
                    .from('knowledge_faqs')
                    .update(updates)
                    .eq('id', id);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
