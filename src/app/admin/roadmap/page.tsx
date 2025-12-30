'use client';

// Simplified client component for Admin example
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { ListOrdered } from 'lucide-react';

export default function AdminRoadmapPage() {
    const [requests, setRequests] = useState<any[]>([]);

    useEffect(() => {
        const fetchAll = async () => {
            const supabase = createClient();
            const { data } = await (supabase as any)
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
