'use client';

import { useState, useEffect } from 'react';
import { getAllFlags, updateFlag, createFlag, FeatureFlag } from '@/lib/feature-flags';
import { ToggleLeft, ToggleRight, Edit2, Plus, RefreshCw } from 'lucide-react';

export default function FeatureManager() {
    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newKey, setNewKey] = useState('');
    const [newDesc, setNewDesc] = useState('');

    const load = async () => {
        setLoading(true);
        const data = await getAllFlags();
        setFlags(data || []);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleToggle = async (key: string, current: boolean) => {
        // Optimistic update
        setFlags(flags.map(f => f.key === key ? { ...f, is_enabled: !current } : f));
        await updateFlag(key, { is_enabled: !current });
    };

    const handleCreate = async () => {
        if (!newKey) return;
        await createFlag(newKey, newDesc);
        setIsCreating(false);
        setNewKey('');
        setNewDesc('');
        load();
    };

    return (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <ToggleRight className="text-indigo-600" /> Feature Flags
                </h3>
                <div className="flex gap-2">
                    <button onClick={load} className="p-1.5 hover:bg-gray-200 rounded text-gray-500">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Create Form */}
            {isCreating && (
                <div className="p-4 bg-indigo-50 border-b space-y-3">
                    <input
                        className="w-full text-sm p-2 border rounded"
                        placeholder="Feature Key (e.g. new_dashboard)"
                        value={newKey}
                        onChange={e => setNewKey(e.target.value)}
                    />
                    <input
                        className="w-full text-sm p-2 border rounded"
                        placeholder="Description"
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsCreating(false)} className="text-xs text-gray-500 hover:underline">Cancel</button>
                        <button onClick={handleCreate} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded font-bold">Save</button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="divide-y max-h-[400px] overflow-auto">
                {flags.map((flag) => (
                    <div key={flag.key} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                        <div>
                            <div className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-1.5 rounded inline-block mb-1">
                                {flag.key}
                            </div>
                            <div className="text-sm text-gray-600">{flag.description}</div>
                            {flag.percentage < 100 && (
                                <div className="text-[10px] text-orange-600 font-bold mt-1">
                                    Rollout: {flag.percentage}%
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => handleToggle(flag.key, flag.is_enabled)}
                            className={`transition-colors ${flag.is_enabled ? 'text-green-500 hover:text-green-600' : 'text-gray-300 hover:text-gray-400'}`}
                        >
                            {flag.is_enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                        </button>
                    </div>
                ))}
                {flags.length === 0 && !loading && (
                    <div className="p-8 text-center text-sm text-gray-500">No flags found.</div>
                )}
            </div>
        </div>
    );
}
