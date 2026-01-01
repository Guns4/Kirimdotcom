'use client';
import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';

export default function BroadcastManager({ adminKey }: { adminKey: string }) {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/communication/announcements', {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setAnnouncements(data.announcements || []);
            }
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey) fetchAnnouncements();
    }, [adminKey]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const payload = {
            id: editingItem?.id,
            title: formData.get('title'),
            content: formData.get('content'),
            type: formData.get('type'),
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date') || null,
            is_active: formData.get('is_active') === 'on',
            target_users: formData.get('target_users')
        };

        try {
            const res = await fetch('/api/admin/communication/announcements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(editingItem ? '✅ Announcement updated!' : '✅ Announcement created!');
                setShowForm(false);
                setEditingItem(null);
                fetchAnnouncements();
                e.currentTarget.reset();
            } else {
                alert('Failed to save announcement');
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this announcement?')) return;

        try {
            const res = await fetch(`/api/admin/communication/announcements?id=${id}`, {
                method: 'DELETE',
                headers: { 'x-admin-secret': adminKey }
            });

            if (res.ok) {
                fetchAnnouncements();
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    const getTypeColor = (type: string) => {
        const colors: any = {
            INFO: 'bg-blue-100 text-blue-700 border-blue-200',
            WARNING: 'bg-orange-100 text-orange-700 border-orange-200',
            PROMO: 'bg-green-100 text-green-700 border-green-200',
            MAINTENANCE: 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[type] || colors.INFO;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Megaphone size={24} /> Broadcast Center
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Send announcements to all users via dashboard banners
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchAnnouncements}
                        disabled={loading}
                        className="px-4 py-2 bg-white border rounded-lg hover:bg-slate-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setShowForm(!showForm);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        New Announcement
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow border">
                    <h4 className="font-bold mb-4">
                        {editingItem ? 'Edit Announcement' : 'New Announcement'}
                    </h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">Title</label>
                            <input
                                name="title"
                                defaultValue={editingItem?.title}
                                required
                                className="w-full border p-2 rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">Message</label>
                            <textarea
                                name="content"
                                defaultValue={editingItem?.content}
                                required
                                rows={4}
                                className="w-full border p-2 rounded"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Type</label>
                                <select
                                    name="type"
                                    defaultValue={editingItem?.type || 'INFO'}
                                    className="w-full border p-2 rounded"
                                >
                                    <option value="INFO">Info</option>
                                    <option value="WARNING">Warning</option>
                                    <option value="PROMO">Promo</option>
                                    <option value="MAINTENANCE">Maintenance</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Start Date</label>
                                <input
                                    name="start_date"
                                    type="datetime-local"
                                    defaultValue={editingItem?.start_date?.slice(0, 16)}
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">End Date</label>
                                <input
                                    name="end_date"
                                    type="datetime-local"
                                    defaultValue={editingItem?.end_date?.slice(0, 16)}
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    defaultChecked={editingItem?.is_active !== false}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm font-bold">Active</span>
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                            >
                                {editingItem ? 'Update' : 'Create'} Announcement
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingItem(null);
                                }}
                                className="px-4 py-2 bg-slate-200 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-3">
                {announcements.map((item) => (
                    <div
                        key={item.id}
                        className={`p-4 rounded-xl border-2 ${getTypeColor(item.type)}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                                <h4 className="font-bold">{item.title}</h4>
                                <p className="text-sm mt-1">{item.content}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditingItem(item);
                                        setShowForm(true);
                                    }}
                                    className="p-2 bg-white rounded hover:bg-slate-100"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 bg-white rounded hover:bg-red-100"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3 text-xs">
                            <span>{item.is_active ? '✅ Active' : '⏸️ Inactive'}</span>
                            <span>Start: {new Date(item.start_date).toLocaleDateString()}</span>
                            {item.end_date && (
                                <span>End: {new Date(item.end_date).toLocaleDateString()}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
