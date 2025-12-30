import { FinanceTower } from '@/components/admin/finance/FinanceTower';

export default function FinanceTowerPage() {
    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Finance Control Tower</h1>
                <p className="text-gray-500">Monitor semua arus kas dengan deteksi anomali otomatis</p>
            </div>

            <FinanceTower />
        </div>
    );
}
