'use client';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Copy, RefreshCw, Check } from 'lucide-react';

export default function ApiKeyCard() {
    const [isVisible, setIsVisible] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [apiKey, setApiKey] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchApiKey();
    }, []);

    const fetchApiKey = async () => {
        setLoading(true);
        try {
            // Get current user
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                window.location.href = '/login?redirect=/console';
                return;
            }

            // Fetch API key from database
            const { data: keys } = await supabase
                .from('saas_api_keys')
                .select('api_key')
                .eq('user_id', user.id)
                .eq('is_active', true)
                .limit(1)
                .single();

            if (keys?.api_key) {
                setApiKey(keys.api_key);
            }
        } catch (error) {
            console.error('Error fetching API key:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleRegenerate = async () => {
        if (!confirm('Regenerate API key? Old key will stop working immediately.')) return;

        setGenerating(true);
        try {
            const res = await fetch('/api/console/generate-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (res.ok) {
                await fetchApiKey();
                alert('✅ New API key generated!');
            } else {
                alert('❌ Failed to generate new key');
            }
        } catch (error) {
            alert('Error generating key');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-12 bg-slate-100 rounded mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
        );
    }

    if (!apiKey) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">No API Key Yet</h3>
                <p className="text-slate-500 mb-4">Generate your first API key to start using the API.</p>
                <button
                    onClick={handleRegenerate}
                    disabled={generating}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                    {generating ? '⏳ Generating...' : '🔑 Generate API Key'}
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Secret API Key</h3>
                    <p className="text-slate-500 text-sm">Gunakan key ini di header request `x-api-key`.</p>
                </div>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded border border-blue-100 uppercase">
                    Production
                </span>
            </div>

            <div className="flex items-center gap-3 bg-slate-100 p-3 rounded-lg border border-slate-200 mb-4">
                <code className="flex-1 font-mono text-slate-700 text-sm break-all">
                    {isVisible ? apiKey : apiKey.substring(0, 8) + '************************'}
                </code>
                <button
                    onClick={() => setIsVisible(!isVisible)}
                    className="p-2 hover:bg-white rounded-md text-slate-500 hover:text-blue-600 transition-all"
                    title={isVisible ? 'Hide Key' : 'Show Key'}
                >
                    {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button
                    onClick={handleCopy}
                    className="p-2 hover:bg-white rounded-md text-slate-500 hover:text-green-600 transition-all"
                    title="Copy Key"
                >
                    {isCopied ? <Check size={18} /> : <Copy size={18} />}
                </button>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <p className="text-xs text-red-500">Jangan bagikan key ini kepada siapapun.</p>
                <button
                    onClick={handleRegenerate}
                    disabled={generating}
                    className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-50"
                >
                    <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
                    Regenerate Key
                </button>
            </div>
        </div>
    );
}
