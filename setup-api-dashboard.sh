#!/bin/bash

# =============================================================================
# B2D API Dashboard Setup (Developer Keys)
# =============================================================================

echo "Initializing Developer API Dashboard..."
echo "================================================="

# 1. Database Schema
echo "1. Generating SQL Schema: api_keys_schema.sql"
cat <<EOF > api_keys_schema.sql
-- 1. API Keys Table
CREATE TABLE IF NOT EXISTS public.api_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    label text NOT NULL,
    key_hash text NOT NULL, -- Storing SHA-256 hash, NOT the actual key
    prefix text NOT NULL, -- First few chars for identification (e.g. 'sk_live_1234...')
    last_used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Index for lookup
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(key_hash);

-- 3. RLS Policies
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own keys"
    ON public.api_keys FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own keys"
    ON public.api_keys FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own keys"
    ON public.api_keys FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
EOF
echo "   [?] Schema created."

# 2. Backend Logic (Server Actions)
echo "2. Creating Server Actions: src/app/actions/api-keys.ts"
mkdir -p src/app/actions

cat <<EOF > src/app/actions/api-keys.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { randomBytes, createHash } from 'crypto';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function listApiKeys() {
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];

    const { data } = await supabase
        .from('api_keys')
        .select('id, label, prefix, created_at, last_used_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
    return data || [];
}

export async function createApiKey(label: string) {
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Unauthorized');

    // 1. Generate Secure Key
    // Format: sk_live_<24_bytes_hex>
    const rawKey = \`sk_live_\${randomBytes(24).toString('hex')}\`;
    
    // 2. Hash it for storage (SHA-256)
    const hash = createHash('sha256').update(rawKey).digest('hex');
    
    // 3. Store metadata + hash (Client never sees key again after this response)
    const { error } = await supabase.from('api_keys').insert({
        user_id: user.id,
        label: label,
        key_hash: hash,
        prefix: rawKey.substring(0, 12) + '...' // Store recognizable prefix
    });

    if (error) throw new Error(error.message);

    revalidatePath('/dashboard/developer');
    
    // RETURN RAW KEY ONE TIME ONLY
    return { secretKey: rawKey };
}

export async function revokeApiKey(id: string) {
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) throw new Error(error.message);
    revalidatePath('/dashboard/developer');
}
EOF
echo "   [?] Server Actions created."

# 3. Developer Dashboard UI
echo "3. Creating Page: src/app/dashboard/developer/page.tsx"
mkdir -p src/app/dashboard/developer

cat <<EOF > src/app/dashboard/developer/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Key, Copy, Eye, AlertTriangle, Terminal } from 'lucide-react';
import { listApiKeys, createApiKey, revokeApiKey } from '@/app/actions/api-keys';

export default function DeveloperDashboard() {
    const [keys, setKeys] = useState<any[]>([]);
    const [newKey, setNewKey] = useState<string | null>(null);
    const [label, setLabel] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadKeys();
    }, []);

    const loadKeys = async () => {
        const data = await listApiKeys();
        setKeys(data);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await createApiKey(label || 'My API Key');
            setNewKey(res.secretKey);
            setLabel('');
            loadKeys();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm('Are you sure? Any application using this key will immediately stop working.')) return;
        
        try {
            await revokeApiKey(id);
            loadKeys();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Developer Settings</h1>
                    <p className="text-slate-500">Manage your Secret API Keys for server-side integration.</p>
                </div>
            </div>

            {/* New Key Result Modal/Alert */}
            {newKey && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm animate-fade-in relative">
                    <button 
                        onClick={() => setNewKey(null)}
                        className="absolute top-4 right-4 text-green-700 hover:text-green-900"
                    >
                        ✕
                    </button>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-100 rounded-lg text-green-700">
                            <Key className="w-6 h-6" />
                        </div>
                        <div className="w-full">
                            <h3 className="font-bold text-green-900 text-lg mb-1">API Key Created Successfully!</h3>
                            <p className="text-green-800 text-sm mb-4">
                                Please copy this key now. For your security, <span className="font-bold">we will never show it again.</span>
                            </p>
                            
                            <div className="flex items-center gap-2">
                                <code className="block w-full bg-white border border-green-200 p-3 rounded font-mono text-sm text-slate-700 break-all">
                                    {newKey}
                                </code>
                                <button
                                    onClick={() => navigator.clipboard.writeText(newKey)}
                                    className="p-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                    title="Copy to Clipboard"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Form */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Generate New Key</h3>
                <form onSubmit={handleCreate} className="flex gap-4">
                    <input 
                        type="text" 
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="Key Name (e.g. Production Server)"
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 transition flex items-center gap-2"
                    >
                        {loading ? 'Generating...' : (
                            <>
                                <Plus className="w-4 h-4" /> Create Secret Key
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Keys Key List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-700">Active API Keys</h3>
                    <span className="text-xs font-mono text-slate-400">Total: {keys.length}</span>
                </div>

                {keys.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <Terminal className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No API keys generated yet.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-3">Label</th>
                                <th className="px-6 py-3">Key Prefix</th>
                                <th className="px-6 py-3">Created</th>
                                <th className="px-6 py-3">Last Used</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {keys.map((k) => (
                                <tr key={k.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 font-medium text-slate-900">{k.label}</td>
                                    <td className="px-6 py-4 font-mono text-slate-500 bg-slate-50/50 w-fit rounded">
                                        {k.prefix}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(k.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleRevoke(k.id)}
                                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition"
                                            title="Revoke Key"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3 text-sm text-blue-800">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p>
                    These keys allow full access to your account via API. Do not share them in client-side code (browsers, mobile apps). Keep them secure in your backend environment variables.
                </p>
            </div>
        </div>
    );
}
EOF
echo "   [?] Dashboard Page created."

echo ""
echo "================================================="
echo "API Dashboard Setup Complete!"
echo "1. Run 'api_keys_schema.sql' in Supabase."
echo "2. Visit '/dashboard/developer' to manage your keys."
