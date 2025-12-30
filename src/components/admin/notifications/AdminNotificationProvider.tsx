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
