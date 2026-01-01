'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Package, ShoppingCart, X } from 'lucide-react';

export default function Omnibar({ adminKey, onClose }: { adminKey: string, onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length < 3) {
                setResults(null);
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(`/api/admin/global-search?q=${encodeURIComponent(query)}`, {
                    headers: { 'x-admin-secret': adminKey }
                });
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                }
            } catch (error) {
                console.error('Search failed:', error);
            }
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [query, adminKey]);

    return (
        <div
            className="fixed inset-0 bg-black/50 z-[100] flex items-start justify-center pt-20 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center border-b p-4 gap-3">
                    <Search className="text-slate-400" size={20} />
                    <input
                        ref={inputRef}
                        className="flex-1 outline-none text-lg"
                        placeholder="Search Users, Orders, Products..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <button onClick={onClose} className="hover:bg-slate-100 p-1 rounded">
                        <X className="text-slate-400 hover:text-red-500" size={20} />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {loading && (
                        <div className="p-8 text-center text-slate-400">
                            Searching mainframe...
                        </div>
                    )}

                    {!loading && results && (
                        <div className="space-y-4 p-2">
                            {/* USERS */}
                            {results.users?.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 ml-2">Users</h4>
                                    {results.users.map((u: any) => (
                                        <div
                                            key={u.id}
                                            className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded cursor-pointer border border-transparent hover:border-slate-200 transition"
                                        >
                                            <div className="bg-blue-100 p-2 rounded-full">
                                                <User size={16} className="text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-slate-800">
                                                    {u.full_name || 'No Name'}
                                                    {u.is_banned && <span className="text-red-500 text-xs ml-2">(BANNED)</span>}
                                                </div>
                                                <div className="text-xs text-slate-500">{u.email}</div>
                                            </div>
                                            <div className="text-xs text-green-600 font-mono">
                                                Rp {u.wallet_balance?.toLocaleString() || 0}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ORDERS */}
                            {results.orders?.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 ml-2">Orders</h4>
                                    {results.orders.map((o: any) => (
                                        <div
                                            key={o.id}
                                            className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded cursor-pointer border border-transparent hover:border-slate-200 transition"
                                        >
                                            <div className="bg-green-100 p-2 rounded-full">
                                                <ShoppingCart size={16} className="text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-slate-800">{o.trx_id}</div>
                                                <div className="text-xs text-slate-500">
                                                    Rp {o.total_amount?.toLocaleString()} • {o.order_status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* PRODUCTS */}
                            {results.products?.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 ml-2">Products</h4>
                                    {results.products.map((p: any) => (
                                        <div
                                            key={p.id}
                                            className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded cursor-pointer border border-transparent hover:border-slate-200 transition"
                                        >
                                            <div className="bg-purple-100 p-2 rounded-full">
                                                <Package size={16} className="text-purple-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-slate-800">{p.name}</div>
                                                <div className="text-xs text-slate-500">
                                                    Stock: {p.stock} • {p.type}
                                                </div>
                                            </div>
                                            <div className="text-xs text-green-600 font-mono">
                                                Rp {p.price_sell?.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {results.users?.length === 0 && results.orders?.length === 0 && results.products?.length === 0 && (
                                <div className="p-8 text-center text-slate-400">
                                    No results found for &quot;{query}&quot;
                                </div>
                            )}
                        </div>
                    )}

                    {!loading && !results && query.length > 0 && query.length < 3 && (
                        <div className="p-8 text-center text-slate-400">
                            Type at least 3 characters to search...
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-50 p-2 text-xs text-center text-slate-400 border-t">
                    Press ESC to close
                </div>
            </div>
        </div>
    );
}
