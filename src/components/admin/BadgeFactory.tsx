'use client';
import React, { useState, useEffect } from 'react';
import { Award, Plus } from 'lucide-react';

export default function BadgeFactory({ adminKey }: { adminKey: string }) {
    const [badges, setBadges] = useState<any[]>([]);
    const [showCreate, setShowCreate] = useState(false);

    const fetchBadges = async () => {
        try {
            const res = await fetch('/api/admin/gamification/users', {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setBadges(data.badges || []);
            }
        } catch (error) {
            console.error('Failed to fetch badges:', error);
        }
    };

    useEffect(() => {
        if (adminKey) fetchBadges();
    }, [adminKey]);

    const handleCreateBadge = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const payload = {
            action: 'CREATE_BADGE',
            badge_data: {
                badge_code: formData.get('code'),
                name: formData.get('name'),
                description: formData.get('description'),
                icon_url: formData.get('icon_url'),
                criteria_type: formData.get('criteria_type'),
                rarity: formData.get('rarity')
            }
        };

        try {
            const res = await fetch('/api/admin/gamification/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('✅ Badge created!');
                setShowCreate(false);
                fetchBadges();
                e.currentTarget.reset();
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    const getRarityBadge = (rarity: string) => {
        switch (rarity) {
            case 'LEGENDARY': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
            case 'EPIC': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
            case 'RARE': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
            default: return 'bg-gray-200 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h4 className="font-bold flex items-center gap-2">
                    <Award size={20} className="text-purple-600" />
                    Badge Factory
                </h4>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 flex items-center gap-1"
                >
                    <Plus size={14} />
                    New Badge
                </button>
            </div>

            {/* CREATE FORM */}
            {showCreate && (
                <div className="bg-white p-4 rounded-xl border shadow">
                    <form onSubmit={handleCreateBadge} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Code (unique)
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    required
                                    placeholder="SUPER_USER"
                                    className="w-full border rounded px-2 py-1 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="Super User"
                                    className="w-full border rounded px-2 py-1 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                rows={2}
                                className="w-full border rounded px-2 py-1 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Icon URL
                                </label>
                                <input
                                    type="text"
                                    name="icon_url"
                                    placeholder="https://..."
                                    className="w-full border rounded px-2 py-1 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Rarity
                                </label>
                                <select
                                    name="rarity"
                                    className="w-full border rounded px-2 py-1 text-sm"
                                >
                                    <option value="COMMON">Common</option>
                                    <option value="RARE">Rare</option>
                                    <option value="EPIC">Epic</option>
                                    <option value="LEGENDARY">Legendary</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                Criteria Type
                            </label>
                            <select
                                name="criteria_type"
                                className="w-full border rounded px-2 py-1 text-sm"
                            >
                                <option value="MANUAL">Manual (Admin assign)</option>
                                <option value="AUTO_SPEND">Auto (Spending threshold)</option>
                                <option value="AUTO_ORDERS">Auto (Order count)</option>
                                <option value="AUTO_REFERRAL">Auto (Referrals)</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="px-3 py-1 bg-purple-600 text-white rounded text-sm font-bold"
                            >
                                Create Badge
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCreate(false)}
                                className="px-3 py-1 bg-slate-200 rounded text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* BADGE LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {badges.map((badge) => (
                    <div key={badge.id} className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition">
                        <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Award size={24} className="text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-bold text-slate-800">{badge.name}</h5>
                                    <div className={`px-2 py-0.5 rounded-full text-xs font-black ${getRarityBadge(badge.rarity)}`}>
                                        {badge.rarity}
                                    </div>
                                </div>
                                <p className="text-xs text-slate-600 mb-2">{badge.description}</p>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="px-2 py-0.5 bg-slate-100 rounded font-bold text-slate-600">
                                        {badge.criteria_type}
                                    </span>
                                    <code className="text-slate-400">{badge.badge_code}</code>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* INFO */}
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-xs text-purple-800">
                <strong>🏆 Badge Tips:</strong>
                <span className="ml-2">
                    MANUAL = Admin kasih manual (hadiah giveaway). AUTO = System kasih otomatis jika user capai threshold.
                </span>
            </div>
        </div>
    );
}
