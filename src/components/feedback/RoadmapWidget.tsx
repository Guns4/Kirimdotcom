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
            const { data } = await (supabase as any)
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
