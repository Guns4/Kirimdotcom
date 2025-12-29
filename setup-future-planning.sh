#!/bin/bash

# =============================================================================
# Sustainability & Future Planning (Feedback Loop)
# =============================================================================

echo "Initializing Feedback & Roadmap System..."
echo "================================================="

# 1. Database Schema
echo "1. Generating SQL Schema: roadmap_schema.sql"
cat <<EOF > roadmap_schema.sql
-- 1. Feature Requests Table
CREATE TABLE IF NOT EXISTS public.feature_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'proposed', -- 'proposed', 'planned', 'in_progress', 'completed'
    vote_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Votes Table (Prevent double voting)
CREATE TABLE IF NOT EXISTS public.feature_votes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    request_id uuid REFERENCES public.feature_requests(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, request_id)
);

-- 3. Trigger to Update Vote Count
CREATE OR REPLACE FUNCTION public.update_vote_count()
RETURNS TRIGGER AS \$\$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.feature_requests 
        SET vote_count = vote_count + 1 
        WHERE id = NEW.request_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.feature_requests 
        SET vote_count = vote_count - 1 
        WHERE id = OLD.request_id;
    END IF;
    RETURN NULL;
END;
\$\$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vote_count
AFTER INSERT OR DELETE ON public.feature_votes
FOR EACH ROW EXECUTE FUNCTION public.update_vote_count();

-- Enable RLS
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read requests" ON public.feature_requests FOR SELECT USING (true);
CREATE POLICY "Users can create requests" ON public.feature_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can vote" ON public.feature_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
EOF
echo "   [?] Schema created."

# 2. Server Actions
echo "2. Creating Server Actions: src/app/actions/roadmap.ts"
mkdir -p src/app/actions

cat <<EOF > src/app/actions/roadmap.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function submitFeature(formData: FormData) {
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be logged in');

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    const { error } = await supabase.from('feature_requests').insert({
        user_id: user.id,
        title,
        description
    });

    if (error) throw new Error(error.message);
    revalidatePath('/dashboard'); // Update widget
}

export async function voteFeature(requestId: string) {
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be logged in');

    // Optimistic check done by database constraints, but we can catch here
    const { error } = await supabase.from('feature_votes').insert({
        user_id: user.id,
        request_id: requestId
    });

    if (error) {
        // If duplicate, maybe toggle (unvote)? For now, just error or ignore.
        console.error(error);
    }
    revalidatePath('/dashboard');
}
EOF
echo "   [?] Server Actions created."

# 3. User Widget
echo "3. Creating UI Widget: src/components/feedback/RoadmapWidget.tsx"
mkdir -p src/components/feedback

cat <<EOF > src/components/feedback/RoadmapWidget.tsx
'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Lightbulb, ThumbsUp, Plus } from 'lucide-react';
import { voteFeature, submitFeature } from '@/app/actions/roadmap';

// Types
interface FeatureRequest {
    id: string;
    title: string;
    description: string;
    vote_count: number;
}

export function RoadmapWidget() {
    const [features, setFeatures] = useState<FeatureRequest[]>([]);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const fetchTop = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from('feature_requests')
                .select('*')
                .eq('status', 'proposed')
                .order('vote_count', { ascending: false })
                .limit(3);
            if (data) setFeatures(data);
        };
        fetchTop();
    }, []);

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-sm border border-indigo-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-indigo-900">Future Roadmap</h3>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-full hover:bg-indigo-700 transition flex items-center gap-1"
                >
                    <Plus className="w-3 h-3" />
                    Saran Fitur
                </button>
            </div>

            {showForm && (
                <form action={async (fd) => {
                    await submitFeature(fd);
                    setShowForm(false);
                    alert('Terima kasih! Saran Anda telah disimpan.');
                }} className="mb-4 bg-white p-3 rounded-lg border border-indigo-100 animate-fade-in">
                    <input name="title" placeholder="Judul Fitur" required className="w-full mb-2 text-sm border-b pb-1 outline-none" />
                    <textarea name="description" placeholder="Jelaskan kebutuhan Anda..." required className="w-full text-xs text-gray-600 outline-none resize-none h-16"></textarea>
                    <button type="submit" className="mt-2 w-full bg-indigo-50 text-indigo-600 text-xs py-1 rounded hover:bg-indigo-100">Kirim Saran</button>
                </form>
            )}

            <div className="space-y-3">
                {features.map((f) => (
                    <div key={f.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-50 shadow-sm group">
                        <div>
                            <p className="font-semibold text-sm text-gray-800">{f.title}</p>
                            <p className="text-xs text-gray-400 line-clamp-1">{f.description}</p>
                        </div>
                        <button 
                            onClick={async () => {
                                await voteFeature(f.id);
                                // Optimistic update or wait for revalidate
                            }}
                            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition"
                        >
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-[10px] font-bold">{f.vote_count}</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
EOF
echo "   [?] UI Widget created."

# 4. Admin Page
echo "4. Creating Admin Priority View: src/app/admin/roadmap/page.tsx"
mkdir -p src/app/admin/roadmap

cat <<EOF > src/app/admin/roadmap/page.tsx
'use client';

// Simplified client component for Admin example
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { ListOrdered, CheckCircle, Clock } from 'lucide-react';

export default function AdminRoadmapPage() {
    const [requests, setRequests] = useState<any[]>([]);

    useEffect(() => {
        const fetchAll = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from('feature_requests')
                .select('*')
                .order('vote_count', { ascending: false });
            if (data) setRequests(data);
        };
        fetchAll();
    }, []);

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ListOrdered className="w-6 h-6" /> Priority Queue (Top Voted)
            </h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 text-sm">
                        <tr>
                            <th className="p-4 border-b">Votes</th>
                            <th className="p-4 border-b">Feature</th>
                            <th className="p-4 border-b">Status</th>
                            <th className="p-4 border-b">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50">
                                <td className="p-4 border-b text-center w-24">
                                    <div className="bg-indigo-100 text-indigo-700 font-bold rounded-lg py-1 px-2">
                                        {r.vote_count}
                                    </div>
                                </td>
                                <td className="p-4 border-b">
                                    <p className="font-bold text-gray-900">{r.title}</p>
                                    <p className="text-sm text-gray-500">{r.description}</p>
                                </td>
                                <td className="p-4 border-b">
                                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 uppercase">
                                        {r.status}
                                    </span>
                                </td>
                                <td className="p-4 border-b">
                                    <button className="text-blue-600 hover:underline text-sm font-medium">Mark Planned</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
EOF
echo "   [?] Admin Page created."

echo ""
echo "================================================="
echo "Future Planning System Ready!"
echo "1. Run 'roadmap_schema.sql' in Supabase."
echo "2. Add '<RoadmapWidget />' to your User Dashboard to start collecting feedback."
echo "3. Monitor '/admin/roadmap' to decide what to build next."
