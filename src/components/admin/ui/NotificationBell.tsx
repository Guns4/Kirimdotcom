'use client';
import React, { useState, useEffect } from 'react';
import { Bell, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function NotificationBell({ adminKey }: { adminKey: string }) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/admin/notifications?unread=true', {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.notifications?.filter((n: any) => !n.is_read).length || 0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        if (adminKey) {
            fetchNotifications();
            // Poll every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [adminKey]);

    const handleMarkAsRead = async (notifId: string) => {
        try {
            await fetch('/api/admin/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify({ notification_id: notifId })
            });
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await fetch('/api/admin/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify({ mark_all_read: true })
            });
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'CRITICAL': return <AlertCircle className="text-red-600" size={18} />;
            case 'WARNING': return <AlertTriangle className="text-orange-600" size={18} />;
            default: return <Info className="text-blue-600" size={18} />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'CRITICAL': return 'bg-red-50 border-red-200 text-red-800';
            case 'WARNING': return 'bg-orange-50 border-orange-200 text-orange-800';
            default: return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 hover:bg-slate-100 rounded-lg transition"
            >
                <Bell size={20} className="text-slate-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDropdown(false)}
                    ></div>

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border z-50 max-h-[500px] overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h4 className="font-bold text-slate-800">Notifications</h4>
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-xs text-blue-600 hover:underline"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button onClick={() => setShowDropdown(false)}>
                                    <X size={18} className="text-slate-400 hover:text-slate-600" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">
                                    <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>No new notifications</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 border-b hover:bg-slate-50 cursor-pointer transition ${!notif.is_read ? 'bg-blue-50/50' : ''
                                            }`}
                                        onClick={() => {
                                            handleMarkAsRead(notif.id);
                                            if (notif.link_action) {
                                                window.location.href = notif.link_action;
                                            }
                                        }}
                                    >
                                        <div className="flex gap-3">
                                            <div className="shrink-0">{getIcon(notif.type)}</div>
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-800">{notif.message}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {new Date(notif.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            {!notif.is_read && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1"></div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
