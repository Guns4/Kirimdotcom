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
        const { data: posts, error } = await supabase
            .from('content_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ posts: posts || [] });
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
        const { id, slug, title, content, category, is_published, meta_desc, author_id } = body;

        if (id) {
            // Update existing post
            const { error } = await supabase
                .from('content_posts')
                .update({
                    slug,
                    title,
                    content,
                    category,
                    is_published,
                    meta_desc,
                    updated_at: new Date().toISOString(),
                    published_at: is_published ? new Date().toISOString() : null
                })
                .eq('id', id);

            if (error) throw error;

            return NextResponse.json({ success: true });
        } else {
            // Create new post
            if (!slug || !title) {
                return NextResponse.json({ error: 'Slug and title required' }, { status: 400 });
            }

            const { error } = await supabase
                .from('content_posts')
                .insert({
                    slug,
                    title,
                    content: content || '',
                    category: category || 'general',
                    is_published: is_published || false,
                    meta_desc: meta_desc || '',
                    author_id,
                    published_at: is_published ? new Date().toISOString() : null
                });

            if (error) throw error;

            return NextResponse.json({ success: true });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const postId = searchParams.get('id');

        if (!postId) {
            return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('content_posts')
            .delete()
            .eq('id', postId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
