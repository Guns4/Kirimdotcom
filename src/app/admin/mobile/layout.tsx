import { BottomNav } from '@/components/admin/mobile/BottomNav';

export default function MobileAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Mobile Header */}
            <header className="bg-white border-b px-4 py-3 sticky top-0 z-40 flex items-center justify-between">
                <h1 className="font-bold text-lg text-gray-900">KirimAdmin</h1>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                    KA
                </div>
            </header>

            <main className="p-4">
                {children}
            </main>

            <BottomNav />
        </div>
    );
}
