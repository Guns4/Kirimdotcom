'use client';
import React, { useState, useEffect } from 'react';
import { Upload, ExternalLink, BarChart2, Eye, MousePointer, RefreshCw } from 'lucide-react';

export default function MonetizationManager({ adminKey }: { adminKey: string }) {
    const [ads, setAds] = useState<any[]>([]);
    const [zones, setZones] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedZone, setSelectedZone] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/ads/manage', {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setAds(data.ads || []);
                setZones(data.zones || []);
                if (data.zones && data.zones.length > 0) {
                    setSelectedZone(data.zones[0].code);
                }
            }
        } catch (error) {
            console.error('Failed to fetch ads:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey) fetchData();
    }, [adminKey]);

    const handleCreateAd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const payload = {
            name: formData.get('name'),
            zone_code: selectedZone,
            image_url: formData.get('image_url'),
            target_url: formData.get('target_url'),
            end_date: formData.get('end_date')
        };

        try {
            const res = await fetch('/api/admin/ads/manage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Iklan Berhasil Tayang!');
                fetchData();
                e.currentTarget.reset();
            } else {
                alert('Gagal membuat iklan');
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    const currentZoneInfo = zones.find(z => z.code === selectedZone);
    const totalViews = ads.reduce((acc, curr) => acc + (curr.views_count || 0), 0);
    const totalClicks = ads.reduce((acc, curr) => acc + (curr.clicks_count || 0), 0);
    const activeCampaigns = ads.filter(a => a.is_active).length;
    const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0.00';

    return (
        <div className="space-y-6">
            {/* HEADER STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <h4 className="text-green-800 font-bold flex items-center gap-2 text-sm">
                        <Eye size={16} /> Total Impressions
                    </h4>
                    <p className="text-3xl font-black text-green-900 mt-1">
                        {totalViews.toLocaleString()}
                    </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h4 className="text-blue-800 font-bold flex items-center gap-2 text-sm">
                        <MousePointer size={16} /> Total Clicks
                    </h4>
                    <p className="text-3xl font-black text-blue-900 mt-1">
                        {totalClicks.toLocaleString()}
                    </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <h4 className="text-purple-800 font-bold flex items-center gap-2 text-sm">
                        <BarChart2 size={16} /> Active Campaigns
                    </h4>
                    <p className="text-3xl font-black text-purple-900 mt-1">
                        {activeCampaigns}
                    </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <h4 className="text-orange-800 font-bold flex items-center gap-2 text-sm">
                        CTR (Click Rate)
                    </h4>
                    <p className="text-3xl font-black text-orange-900 mt-1">
                        {ctr}%
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* CREATE AD FORM */}
                <div className="bg-white p-6 rounded-xl shadow border col-span-1">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-slate-700">Pasang Iklan Baru</h3>
                        <button onClick={fetchData} disabled={loading} className="text-blue-600 hover:text-blue-700">
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <form onSubmit={handleCreateAd} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">PILIH POSISI (ZONA)</label>
                            <select
                                className="w-full border p-2 rounded bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedZone}
                                onChange={(e) => setSelectedZone(e.target.value)}
                            >
                                {zones.map(z => (
                                    <option key={z.code} value={z.code}>{z.name}</option>
                                ))}
                            </select>
                            {currentZoneInfo && (
                                <p className="text-xs text-orange-600 mt-1">
                                    ⚠️ Required size: <strong>{currentZoneInfo.required_width} × {currentZoneInfo.required_height} px</strong>
                                </p>
                            )}
                        </div>

                        <input
                            name="name"
                            placeholder="Campaign Name (e.g., Promo Shopee)"
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">IMAGE URL (BANNER)</label>
                            <input
                                name="image_url"
                                type="url"
                                placeholder="https://..."
                                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Upload image to Storage, then paste link here.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">TARGET URL (AFFILIATE)</label>
                            <input
                                name="target_url"
                                type="url"
                                placeholder="https://shopee.co.id/..."
                                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">END DATE</label>
                            <input
                                name="end_date"
                                type="date"
                                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-slate-900 text-white py-3 rounded font-bold hover:bg-slate-800 flex justify-center items-center gap-2 transition"
                        >
                            <Upload size={18} /> PUBLISH AD
                        </button>
                    </form>
                </div>

                {/* ACTIVE ADS LIST */}
                <div className="bg-white p-6 rounded-xl shadow border col-span-2">
                    <h3 className="font-bold text-lg mb-4 text-slate-700">Active Campaigns</h3>
                    <div className="overflow-y-auto max-h-[600px] space-y-3">
                        {ads.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                No campaigns yet. Create your first ad!
                            </div>
                        ) : (
                            ads.map((ad) => (
                                <div key={ad.id} className="flex gap-4 border rounded-lg p-3 hover:bg-slate-50 transition">
                                    <img
                                        src={ad.image_url}
                                        alt={ad.name}
                                        className="w-24 h-16 object-cover rounded bg-slate-200"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                                        }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-slate-800 truncate">{ad.name}</h4>
                                            <span className="text-xs bg-slate-100 px-2 py-1 rounded border shrink-0 ml-2">
                                                {ad.ad_zones?.name || ad.zone_code}
                                            </span>
                                        </div>
                                        <a
                                            href={ad.target_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-500 flex items-center gap-1 mt-1 hover:underline truncate"
                                        >
                                            <span className="truncate">{ad.target_url}</span>
                                            <ExternalLink size={10} className="shrink-0" />
                                        </a>
                                        <div className="flex gap-4 mt-2 text-xs text-slate-500">
                                            <span>👁️ {ad.views_count?.toLocaleString() || 0}</span>
                                            <span>👆 {ad.clicks_count?.toLocaleString() || 0}</span>
                                            <span>📅 Exp: {ad.end_date}</span>
                                            {ad.is_active ? (
                                                <span className="text-green-600 font-bold">● ACTIVE</span>
                                            ) : (
                                                <span className="text-red-600">● INACTIVE</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
