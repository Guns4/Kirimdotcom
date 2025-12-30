import { getAdminDashboardMetrics } from '@/app/actions/admin-dashboard';
import { ProfitCard } from './ProfitCard';
import { ActionRequiredCard } from './ActionRequiredCard';
import { TrafficLiveCard } from './TrafficLiveCard';

export default async function AdminBentoGrid() {
    const metrics = await getAdminDashboardMetrics();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <ProfitCard amount={metrics.profitToday} />
            <ActionRequiredCard data={metrics} />
            <TrafficLiveCard />

            {/* Vendor Balance Alert (Conditional) */}
            {metrics.vendorBalanceLow && (
                <div className="col-span-full bg-red-600 text-white p-4 rounded-xl flex items-center justify-between animate-pulse">
                    <span className="font-bold">CRITICAL: Vendor Balance is Low! Topup Immediately.</span>
                    <button className="bg-white text-red-600 px-4 py-1 rounded text-sm font-bold">Fix Now</button>
                </div>
            )}
        </div>
    );
}
