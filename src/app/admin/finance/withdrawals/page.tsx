import { getPendingWithdrawals } from '@/app/actions/bulk-payout';
import { BulkPayoutPanel } from '@/components/admin/finance/BulkPayoutPanel';

export const dynamic = 'force-dynamic';

export default async function WithdrawalsPage() {
    const withdrawals = await getPendingWithdrawals();

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Bulk Payout - Withdrawal Management</h1>
                <p className="text-gray-500">Proses pencairan dana secara massal dengan cepat dan aman</p>
            </div>

            <BulkPayoutPanel withdrawals={withdrawals} />
        </div>
    );
}
