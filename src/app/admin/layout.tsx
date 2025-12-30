'use client';

import { AdminCommandPalette } from "@/components/admin/AdminCommandPalette";
import { RoleBasedSidebar } from "@/components/admin/RoleBasedSidebar";
import { AdminNotificationProvider } from "@/components/admin/notifications/AdminNotificationProvider";
import { NotificationDropdown } from "@/components/admin/notifications/NotificationDropdown";
import Link from "next/link";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminNotificationProvider>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r hidden md:flex flex-col fixed inset-y-0 z-50">
                    <div className="h-16 flex items-center px-4 border-b">
                        <Link href="/admin/dashboard" className="flex items-center gap-2">
                            <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold">
                                K
                            </div>
                            <span className="font-bold text-gray-900">KirimAdmin</span>
                        </Link>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4">
                        <RoleBasedSidebar />
                    </div>

                    <div className="p-4 border-t text-xs text-gray-400">
                        &copy; 2024 Kirim.com
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 md:ml-64 relative">
                    <AdminCommandPalette />

                    {/* Admin Header/Navbar with Notification Bell */}
                    <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-40">
                        <h2 className="font-semibold text-gray-700">Admin Dashboard</h2>
                        <div className="flex items-center gap-4">
                            <NotificationDropdown />
                            {/* Add more header items here like user profile etc */}
                        </div>
                    </header>

                    {/* Page Content */}
                    <div>
                        {children}
                    </div>
                </main>
            </div>
        </AdminNotificationProvider>
    );
}
