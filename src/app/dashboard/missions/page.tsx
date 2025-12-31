import { DailyMissionsWidget } from '@/components/gamification/DailyMissionsWidget';

export default function MissionsPage() {
    return (
        <div className="p-6 max-w-md mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Mission Center</h1>
            <p className="text-gray-500 text-sm">Selesaikan misi harian untuk mendapatkan XP dan naik level lebih cepat!</p>
            <DailyMissionsWidget />
        </div>
    );
}
