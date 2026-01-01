'use client';
import React, { useState, useEffect } from 'react';
import { Plug, Plus, Download, Trash2, RefreshCw } from 'lucide-react';

export default function PluginRepository({ adminKey }: { adminKey: string }) {
    const [releases, setReleases] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const fetchReleases = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/plugins/manage', {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setReleases(data.releases || []);
            }
        } catch (error) {
            console.error('Failed to fetch releases:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey) fetchReleases();
    }, [adminKey]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const payload = {
            plugin_slug: formData.get('plugin_slug'),
            version: formData.get('version'),
            file_url: formData.get('file_url'),
            changelog: formData.get('changelog'),
            is_public: formData.get('is_public') === 'on',
            is_stable: formData.get('is_stable') === 'on',
            min_php_version: formData.get('min_php_version'),
            min_wp_version: formData.get('min_wp_version'),
            tested_up_to: formData.get('tested_up_to')
        };

        try {
            const res = await fetch('/api/admin/plugins/manage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('✅ Plugin release published!');
                setShowForm(false);
                fetchReleases();
                e.currentTarget.reset();
            } else {
                const data = await res.json();
                alert('❌ Failed: ' + data.error);
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this release?')) return;

        try {
            const res = await fetch(`/api/admin/plugins/manage?id=${id}`, {
                method: 'DELETE',
                headers: { 'x-admin-secret': adminKey }
            });

            if (res.ok) {
                fetchReleases();
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    const totalDownloads = releases.reduce((acc, r) => acc + (r.download_count || 0), 0);
    const uniquePlugins = [...new Set(releases.map(r => r.plugin_slug))].length;

    return (
        <div className="space-y-6">
            {/* STATS */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="text-blue-600 font-bold text-sm">Total Releases</div>
                    <div className="text-3xl font-black text-blue-900 mt-1">{releases.length}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <div className="text-purple-600 font-bold text-sm">Unique Plugins</div>
                    <div className="text-3xl font-black text-purple-900 mt-1">{uniquePlugins}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="text-green-600 font-bold text-sm">Total Downloads</div>
                    <div className="text-3xl font-black text-green-900 mt-1">{totalDownloads}</div>
                </div>
            </div>

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Plug size={24} /> Plugin Repository
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        B2B plugin distribution for WordPress/WooCommerce clients
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchReleases}
                        disabled={loading}
                        className="px-4 py-2 bg-white border rounded-lg hover:bg-slate-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        New Release
                    </button>
                </div>
            </div>

            {/* FORM */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow border">
                    <h4 className="font-bold mb-4">Publish New Plugin Release</h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">
                                    Plugin Slug
                                </label>
                                <input
                                    name="plugin_slug"
                                    required
                                    placeholder="cekkirim-woocommerce"
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">
                                    Version
                                </label>
                                <input
                                    name="version"
                                    required
                                    placeholder="1.2.0"
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">
                                Download URL
                            </label>
                            <input
                                name="file_url"
                                required
                                type="url"
                                placeholder="https://storage.supabase.co/..."
                                className="w-full border p-2 rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">
                                Changelog
                            </label>
                            <textarea
                                name="changelog"
                                rows={4}
                                placeholder="What's new in this version..."
                                className="w-full border p-2 rounded"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">
                                    Min PHP
                                </label>
                                <input
                                    name="min_php_version"
                                    defaultValue="7.4"
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">
                                    Min WordPress
                                </label>
                                <input
                                    name="min_wp_version"
                                    defaultValue="5.0"
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">
                                    Tested Up To
                                </label>
                                <input
                                    name="tested_up_to"
                                    placeholder="6.4"
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="is_public"
                                    defaultChecked
                                    className="w-4 h-4"
                                />
                                <span className="text-sm font-bold">Public</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="is_stable"
                                    defaultChecked
                                    className="w-4 h-4"
                                />
                                <span className="text-sm font-bold">Stable</span>
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                            >
                                Publish Release
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 bg-slate-200 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* RELEASE LIST */}
            <div className="bg-white rounded-xl shadow border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="p-4 text-left">Plugin</th>
                            <th className="p-4 text-left">Version</th>
                            <th className="p-4 text-left">Downloads</th>
                            <th className="p-4 text-left">Status</th>
                            <th className="p-4 text-left">Released</th>
                            <th className="p-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {releases.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-400">
                                    No releases yet. Publish your first plugin!
                                </td>
                            </tr>
                        ) : (
                            releases.map((release) => (
                                <tr key={release.id} className="hover:bg-slate-50">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{release.plugin_slug}</div>
                                        <div className="text-xs text-slate-500">
                                            PHP {release.min_php_version}+ • WP {release.min_wp_version}+
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                            v{release.version}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1">
                                            <Download size={14} className="text-slate-400" />
                                            <span className="font-bold">{release.download_count || 0}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-1">
                                            {release.is_public && (
                                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                                                    PUBLIC
                                                </span>
                                            )}
                                            {release.is_stable && (
                                                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold">
                                                    STABLE
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs text-slate-500">
                                        {new Date(release.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <a
                                                href={release.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                            >
                                                <Download size={14} />
                                            </a>
                                            <button
                                                onClick={() => handleDelete(release.id)}
                                                className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
