import { TycoonDashboard } from '@/components/gamification/TycoonDashboard';

export default function TycoonPage() {
    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Tycoon HQ</h1>
            <TycoonDashboard />

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-semibold mb-3">Cara Main</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    <li>Kirim paket untuk dapat <strong>+10 XP</strong></li>
                    <li>Cari rute (Cek Ongkir) dapat <strong>+50 XP</strong></li>
                    <li>Referral teman dapat <strong>+200 XP</strong></li>
                    <li>Login harian dapat <strong>+5 XP</strong></li>
                </ul>
            </div>
        </div>
    );
}
