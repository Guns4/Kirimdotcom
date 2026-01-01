import Link from 'next/link';
import { LayoutDashboard, Key, CreditCard, FileText, Settings, LogOut } from 'lucide-react';

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
                <div className="p-6 border-b border-slate-800">
                    <Link href="/business" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">CK</div>
                        <span className="text-lg font-bold text-white tracking-tight">CekKirim <span className="text-blue-500">API</span></span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <NavItem href="/console" icon={<LayoutDashboard size={20} />} label="Overview" active />
                    <NavItem href="/console/keys" icon={<Key size={20} />} label="API Keys" />
                    <NavItem href="/console/billing" icon={<CreditCard size={20} />} label="Billing & Usage" />
                    <NavItem href="/docs" icon={<FileText size={20} />} label="Documentation" />
                    <NavItem href="/console/settings" icon={<Settings size={20} />} label="Settings" />
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                    <h1 className="text-xl font-semibold text-slate-800">Developer Console</h1>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                            System Operational
                        </span>
                        <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
                            DEV
                        </div>
                    </div>
                </header>
                <div className="p-8 max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ href, icon, label, active = false }: any) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${active
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
        >
            {icon}
            {label}
        </Link>
    );
}
