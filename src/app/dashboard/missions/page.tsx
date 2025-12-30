import DailyMissionsWidget from '@/components/gamification/DailyMissionsWidget';
import { Target, Zap, Gift, Calendar } from 'lucide-react';

export const metadata = {
    title: 'Misi Harian - Daily Missions | CekKirim',
    description: 'Selesaikan misi harian dan dapatkan XP serta Coins setiap hari!',
};

export default function MissionsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-4">
                        <Target className="w-4 h-4" />
                        Daily Missions
                    </div>
                    <h1 className="text-4xl font-bold mb-4">
                        Misi Harian 🎯
                    </h1>
                    <p className="text-lg text-orange-100 max-w-2xl">
                        Selesaikan misi setiap hari untuk mendapatkan XP dan Coins.
                        Misi di-reset setiap jam 00:00!
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8 -mt-8">
                <DailyMissionsWidget />
            </div>

            {/* How It Works */}
            <div className="max-w-4xl mx-auto px-4 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                            <Calendar className="w-6 h-6 text-orange-600" />
                        </div>
                        <h3 className="font-bold mb-2">Misi Baru Setiap Hari</h3>
                        <p className="text-sm text-gray-600">
                            4 misi baru di-generate otomatis setiap jam 00:00
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-yellow-600" />
                        </div>
                        <h3 className="font-bold mb-2">Dapatkan XP</h3>
                        <p className="text-sm text-gray-600">
                            XP untuk naik level di Logistics Tycoon
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                            <Gift className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-bold mb-2">Auto-Claim Rewards</h3>
                        <p className="text-sm text-gray-600">
                            Klik claim saat misi selesai untuk dapat hadiah
                        </p>
                    </div>
                </div>
            </div>

            {/* Mission Types */}
            <div className="max-w-4xl mx-auto px-4 pb-12">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4">Jenis Misi</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { icon: '🔑', name: 'Login', xp: '5 XP' },
                            { icon: '📦', name: 'Cek Resi', xp: '20-50 XP' },
                            { icon: '💰', name: 'Topup', xp: '50-100 XP' },
                            { icon: '📤', name: 'Share', xp: '30-80 XP' },
                            { icon: '🎯', name: 'Optimasi', xp: '40 XP' },
                            { icon: '👥', name: 'Referral', xp: '200 XP' },
                            { icon: '🏷️', name: 'Bulk Label', xp: '30 XP' },
                            { icon: '⭐', name: 'Bonus', xp: 'Varies' },
                        ].map(mission => (
                            <div key={mission.name} className="bg-gray-50 rounded-lg p-3 text-center">
                                <div className="text-2xl mb-1">{mission.icon}</div>
                                <div className="text-sm font-medium">{mission.name}</div>
                                <div className="text-xs text-orange-600">{mission.xp}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
