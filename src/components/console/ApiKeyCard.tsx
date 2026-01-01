'use client';
import { useState } from 'react';
import { Eye, EyeOff, Copy, RefreshCw, Check } from 'lucide-react';

export default function ApiKeyCard() {
    const [isVisible, setIsVisible] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // Data ini nantinya diambil dari tabel 'saas_api_keys' via API
    const apiKey = "ck_live_83920984029384029384023984";

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

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
                    {isVisible ? apiKey : apiKey.substring(0, 8) + "************************"}
                </code>
                <button
                    onClick={() => setIsVisible(!isVisible)}
                    className="p-2 hover:bg-white rounded-md text-slate-500 hover:text-blue-600 transition-all"
                    title={isVisible ? "Hide Key" : "Show Key"}
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
                <button className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900">
                    <RefreshCw size={14} />
                    Regenerate Key
                </button>
            </div>
        </div>
    );
}
