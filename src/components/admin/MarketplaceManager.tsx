'use client';
import React, { useState, useEffect } from 'react';

export default function MarketplaceManager({ adminKey }: { adminKey: string }) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);

    // Load Products
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/product/list', {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey) fetchProducts();
    }, [adminKey]);

    // Sync SMM Auto
    const handleSyncSMM = async () => {
        if (!confirm('Ini akan menarik ribuan layanan dari Provider. Lanjut?')) return;
        setSyncing(true);
        try {
            const res = await fetch('/api/admin/smm/sync-services', {
                method: 'POST',
                headers: { 'x-admin-secret': adminKey }
            });
            const result = await res.json();
            alert(result.message || 'Sync Selesai');
            fetchProducts();
        } catch (e) {
            alert('Gagal Sync');
        }
        setSyncing(false);
    };

    // Add Physical Product
    const handleAddPhysical = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const payload = {
            sku: formData.get('sku'),
            name: formData.get('name'),
            type: 'PHYSICAL',
            price_base: Number(formData.get('price_base')),
            price_sell: Number(formData.get('price_sell')),
            stock: Number(formData.get('stock')),
            category_name: 'Supplies',
            description: 'Barang fisik'
        };

        try {
            const res = await fetch('/api/admin/product/manage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Produk Ditambah!');
                fetchProducts();
                e.currentTarget.reset();
            } else {
                alert('Gagal tambah produk');
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded shadow">
                <h3 className="font-bold text-lg">📦 Manajemen Produk ({products.length})</h3>
                <button
                    onClick={handleSyncSMM}
                    disabled={syncing}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 transition"
                >
                    {syncing ? 'Sedang Sync...' : '🔄 Sync SMM Provider'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FORM ADD PHYSICAL PRODUCT */}
                <div className="bg-white p-4 rounded shadow border">
                    <h4 className="font-bold mb-4 text-gray-700">Tambah Barang Fisik (Lakban/Kertas)</h4>
                    <form onSubmit={handleAddPhysical} className="space-y-3">
                        <input
                            name="sku"
                            placeholder="SKU (Unik, misal: LAKBAN-01)"
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input
                            name="name"
                            placeholder="Nama Produk"
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <div className="flex gap-2">
                            <input
                                name="price_base"
                                type="number"
                                placeholder="Modal (Rp)"
                                className="w-1/2 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                name="price_sell"
                                type="number"
                                placeholder="Jual (Rp)"
                                className="w-1/2 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <input
                            name="stock"
                            type="number"
                            placeholder="Stok Awal"
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition"
                        >
                            SIMPAN PRODUK
                        </button>
                    </form>
                </div>

                {/* PRODUCT LIST PREVIEW */}
                <div className="bg-white p-4 rounded shadow border h-80 overflow-y-auto">
                    <h4 className="font-bold mb-4 text-gray-700">Database Produk (Preview)</h4>
                    {loading ? (
                        <p className="text-gray-400">Loading...</p>
                    ) : (
                        <ul className="space-y-2">
                            {products.slice(0, 10).map((p: any) => (
                                <li key={p.id} className="text-sm border-b pb-1 flex justify-between items-center">
                                    <span className="truncate flex-1">{p.name}</span>
                                    <span className={`text-xs font-bold ${p.type === 'PHYSICAL' ? 'text-blue-600' : 'text-purple-600'}`}>
                                        {p.type === 'PHYSICAL' ? `Stok: ${p.stock}` : 'SMM'}
                                    </span>
                                </li>
                            ))}
                            {products.length === 0 && (
                                <li className="text-gray-400 text-sm">Belum ada produk</li>
                            )}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
