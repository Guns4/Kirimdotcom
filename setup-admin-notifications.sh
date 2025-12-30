#!/bin/bash

# =============================================================================
# Monitoring: Realtime Admin Alerts Setup (Task 91)
# =============================================================================

echo "Initializing Admin Notification System..."
echo "================================================="

# 1. SQL Schema
echo "1. Generating SQL: admin_notifications_schema.sql"
cat <<EOF > admin_notifications_schema.sql
-- Table: Admin Notifications
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL, -- INFO, WARNING, CRITICAL, SUCCESS
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;

-- Index for fast retrieval of unread
CREATE INDEX IF NOT EXISTS idx_admin_notif_unread ON public.admin_notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_admin_notif_created ON public.admin_notifications(created_at DESC);
EOF

# 2. Notification Context/Hook (Realtime Logic)
echo "2. Creating Logic: src/components/admin/notifications/AdminNotificationProvider.tsx"
mkdir -p src/components/admin/notifications

cat <<EOF > src/components/admin/notifications/AdminNotificationProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';

interface Notification {
    id: string;
    type: string;
    message: string;
    link_url?: string;
    is_read: boolean;
    created_at: string;
}

interface AdminNotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllRead: () => Promise<void>;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | null>(null);

export function AdminNotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const supabase = createClient();

    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Load initial
    useEffect(() => {
        fetchNotifications();
    }, []);

    // Realtime Subscription
    useEffect(() => {
        const channel = supabase
            .channel('admin-notifications')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'admin_notifications' },
                (payload) => {
                    const newNotif = payload.new as Notification;
                    setNotifications(prev => [newNotif, ...prev]);
                    
                    // Play Sound & Toast
                    playSound();
                    toast(newNotif.message, {
                        icon: <Bell className="w-4 h-4 text-blue-500" />,
                        duration: 5000,
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchNotifications = async () => {
        const { data } = await supabase
            .from('admin_notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
        
        if (data) setNotifications(data);
    };

    const playSound = () => {
        if (!soundEnabled) return;
        // Simple 'ting' sound from public URL or local asset
        const audio = new Audio('https://cdn.freesound.org/previews/352/352651_4019029-lq.mp3'); // Example generic ping
        audio.volume = 0.5;
        audio.play().catch(e => console.error('Audio play failed', e));
    };

    const markAsRead = async (id: string) => {
        await supabase.from('admin_notifications').update({ is_read: true }).eq('id', id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    const markAllRead = async () => {
        // Optimistic update
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        await supabase.from('admin_notifications').update({ is_read: true }).in('id', unreadIds);
    };

    return (
        <AdminNotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllRead }}>
            {children}
            {/* Hidden audio element preload if needed, but new Audio() works for modern browsers usually */}
        </AdminNotificationContext.Provider>
    );
}

export const useAdminNotifications = () => {
    const context = useContext(AdminNotificationContext);
    if (!context) throw new Error('useAdminNotifications must be used within AdminNotificationProvider');
    return context;
};
EOF

# 3. Notification Dropdown UI
echo "3. Creating UI: src/components/admin/notifications/NotificationDropdown.tsx"
cat <<EOF > src/components/admin/notifications/NotificationDropdown.tsx
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
                <Bell className={\`w-6 h-6 \${unreadCount > 0 ? 'text-blue-600 animate-pulse-short' : 'text-gray-500'}\`} />
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
                                        className={\`p-4 hover:bg-gray-50 transition-colors relative \${!notif.is_read ? 'bg-blue-50/30' : ''}\`}
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
EOF

echo ""
echo "================================================="
echo "Admin Notifications Setup Complete!"
echo "1. Run 'admin_notifications_schema.sql'."
echo "2. Wrap your Admin Layout with <AdminNotificationProvider>."
echo "3. Add <NotificationDropdown /> to your Admin Navbar."
