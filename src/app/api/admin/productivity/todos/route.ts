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
        const { data: todos, error } = await supabase
            .from('admin_todos')
            .select('*')
            .order('priority', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ todos: todos || [] });
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
        const { id, task, is_done, priority, due_date } = body;

        if (id) {
            // Update existing todo
            const updateData: any = {};
            if (task !== undefined) updateData.task = task;
            if (is_done !== undefined) {
                updateData.is_done = is_done;
                if (is_done) {
                    updateData.completed_at = new Date().toISOString();
                } else {
                    updateData.completed_at = null;
                }
            }
            if (priority !== undefined) updateData.priority = priority;
            if (due_date !== undefined) updateData.due_date = due_date;

            const { error } = await supabase
                .from('admin_todos')
                .update(updateData)
                .eq('id', id);

            if (error) throw error;
        } else {
            // Create new todo
            if (!task) {
                return NextResponse.json({ error: 'Task required' }, { status: 400 });
            }

            const { error } = await supabase
                .from('admin_todos')
                .insert({
                    task,
                    priority: priority || 'MEDIUM',
                    due_date
                });

            if (error) throw error;
        }

        return NextResponse.json({ success: true });
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
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('admin_todos')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
