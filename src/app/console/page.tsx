import ApiKeyCard from '@/components/console/ApiKeyCard';
import UsageSummary from '@/components/console/UsageSummary';
import { ExternalLink, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function ConsoleDashboard() {
    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Selamat Datang, Developer!</h2>
                    <p className="text-slate-500">Kelola integrasi API logistik Anda di sini.</p>
                </div>
                <div className="hidden md:block">
                    <span className="text-sm text-slate-400">Current Plan:</span>
                    <span className="ml-2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded uppercase tracking-wide">
                        Startup
                    </span>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                <ApiKeyCard />
                <UsageSummary />
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
                <QuickAction
                    title="Baca Dokumentasi"
                    desc="Pelajari cara integrasi endpoint Cek Ongkir."
                    icon={<BookOpen className="h-6 w-6 text-purple-500" />}
                    href="/docs"
                />
                <QuickAction
                    title="Lihat Tagihan"
                    desc="Download invoice dan kelola metode pembayaran."
                    icon={<ExternalLink className="h-6 w-6 text-orange-500" />}
                    href="/console/billing"
                />
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
                    <h3 className="font-bold mb-2">Butuh Bantuan?</h3>
                    <p className="text-slate-400 text-sm mb-4">Tim engineer kami siap membantu integrasi Anda.</p>
                    <button className="text-sm font-bold text-blue-400 hover:text-blue-300">Hubungi Support &rarr;</button>
                </div>
            </div>
        </div>
    );
}

function QuickAction({ title, desc, icon, href }: any) {
    return (
        <Link href={href} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
            <div className="mb-4 p-3 bg-slate-50 rounded-lg w-fit group-hover:bg-slate-100 transition-colors">
                {icon}
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-500">{desc}</p>
        </Link>
    );
}
