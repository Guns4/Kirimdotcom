'use client';

import FinancialDashboard from '@/components/admin/FinancialDashboard';

export default function AdminFinancePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-gray-900 mb-2 flex items-center gap-3">
                        <span className="text-5xl">💰</span>
                        Financial Control Center
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Manage withdrawal requests and monitor financial health
                    </p>
                    <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                        <p className="text-sm text-yellow-800">
                            <strong>⚠️ Important:</strong> This dashboard controls real money transactions. Always
                            verify bank account details before approving withdrawals.
                        </p>
                    </div>
                </div>

                {/* Dashboard Component */}
                <FinancialDashboard />

                {/* Instructions */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-3">📋 Admin Instructions</h3>
                    <div className="space-y-2 text-sm text-blue-800">
                        <p>
                            <strong>✅ To APPROVE:</strong> First manually transfer the money to the user&apos;s bank
                            account, then click APPROVE to record the transaction.
                        </p>
                        <p>
                            <strong>❌ To REJECT:</strong> Click REJECT and the system will automatically refund
                            the amount to the user&apos;s wallet.
                        </p>
                        <p>
                            <strong>💰 Total User Balance:</strong> This is your liability - make sure your bank
                            balance covers this amount.
                        </p>
                        <p>
                            <strong>📊 Net Inflow:</strong> Positive = more money coming in (topups) than going out
                            (withdrawals).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
