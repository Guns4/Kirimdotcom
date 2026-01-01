import { CreditCard, History, Zap } from 'lucide-react';

export default function BillingPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Billing & Credits</h2>
                <p className="text-slate-500">Kelola deposit saldo API dan riwayat pembayaran.</p>
            </div>

            {/* Credit Balance Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-blue-100 font-medium mb-1">Sisa Kredit API</p>
                        <h3 className="text-4xl font-bold">Rp 450.000</h3>
                        <p className="text-sm text-blue-200 mt-2">Cukup untuk ±4,500 hits request lagi.</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                        <Zap className="h-8 w-8 text-yellow-300" />
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <button className="bg-white text-blue-800 px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-sm">
                        + Topup Saldo
                    </button>
                    <button className="bg-blue-700 text-white px-6 py-2 rounded-lg font-bold border border-blue-500 hover:bg-blue-600 transition-colors">
                        Atur Auto-Reload
                    </button>
                </div>
            </div>

            {/* Invoice History */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <History size={18} /> Riwayat Transaksi
                    </h3>
                    <button className="text-sm text-blue-600 hover:underline">Download All</button>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-6 py-3 font-medium">Invoice ID</th>
                            <th className="px-6 py-3 font-medium">Tanggal</th>
                            <th className="px-6 py-3 font-medium">Nominal</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-mono text-slate-600">INV-2023-001</td>
                            <td className="px-6 py-4">12 Des 2023</td>
                            <td className="px-6 py-4 font-bold">Rp 100.000</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">PAID</span></td>
                            <td className="px-6 py-4 text-right"><button className="text-slate-400 hover:text-blue-600">PDF</button></td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-mono text-slate-600">INV-2023-002</td>
                            <td className="px-6 py-4">01 Jan 2024</td>
                            <td className="px-6 py-4 font-bold">Rp 500.000</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">PAID</span></td>
                            <td className="px-6 py-4 text-right"><button className="text-slate-400 hover:text-blue-600">PDF</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
