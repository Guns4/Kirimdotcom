import TycoonDashboard from '@/components/gamification/TycoonDashboard';
import { Trophy, Gamepad2 } from 'lucide-react';

export const metadata = {
    title: 'Logistics Tycoon - Gamification | CekKirim',
    description: 'Bangun kerajaan logistik Anda! Naik level, unlock truck skins, dan dapatkan diskon admin fee.',
};

export default function TycoonPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="relative z-10 py-12 px-4">
                    <div className="max-w-4xl mx-auto text-center text-white">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            <Gamepad2 className="w-4 h-4" />
                            Logistics Tycoon
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Bangun Kerajaan Logistik Anda! 🏆
                        </h1>
                        <p className="text-lg text-purple-200 max-w-2xl mx-auto">
                            Kirim paket, naik level, unlock rewards eksklusif.
                            Dari Garasi Rumah sampai Gudang Raksasa!
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8 -mt-8">
                <TycoonDashboard />
            </div>

            {/* How to Earn XP */}
            <div className="max-w-4xl mx-auto px-4 pb-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        Cara Dapat XP
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                            <div className="text-2xl mb-2">📦</div>
                            <div className="text-sm font-medium">Kirim Paket</div>
                            <div className="text-xs text-purple-200">+10 XP</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                            <div className="text-2xl mb-2">🎯</div>
                            <div className="text-sm font-medium">Optimasi Rute</div>
                            <div className="text-xs text-purple-200">+50 XP</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                            <div className="text-2xl mb-2">👥</div>
                            <div className="text-sm font-medium">Referral</div>
                            <div className="text-xs text-purple-200">+200 XP</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                            <div className="text-2xl mb-2">📅</div>
                            <div className="text-sm font-medium">Login Harian</div>
                            <div className="text-xs text-purple-200">+5 XP</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
