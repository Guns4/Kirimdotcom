'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useAdminNotifications } from './AdminNotificationProvider';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export function NotificationDropdown() {
    const { notifications, unreadCount, markAsRead, markAllRead } = useAdminNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
            >
                <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-blue-600 animate-pulse-short' : 'text-gray-500'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllRead()}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                            >
                                <Check className="w-3 h-3" /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No notifications yet.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors relative ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                                    >
                                        {!notif.is_read && (
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                        )}
                                        <div className="ml-2">
                                            <p className="text-sm text-gray-800 leading-snug">{notif.message}</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs text-gray-400">
                                                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: idLocale })}
                                                </span>
                                                {notif.link_url && (
                                                    <Link
                                                        href={notif.link_url}
                                                        onClick={() => markAsRead(notif.id)}
                                                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                                    >
                                                        View <ExternalLink className="w-3 h-3" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
