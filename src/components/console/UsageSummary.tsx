export default function UsageSummary() {
    // Simulasi data dari DB
    const limit = 10000;
    const used = 4520;
    const percentage = (used / limit) * 100;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">Penggunaan Bulan Ini</h3>
                <span className="text-sm font-medium text-slate-500">Resets on Feb 1</span>
            </div>

            <div className="mb-2 flex justify-between text-sm font-medium">
                <span className="text-slate-700">{used.toLocaleString()} Requests</span>
                <span className="text-slate-400">Limit: {limit.toLocaleString()}</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden">
                <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Success Rate</p>
                    <p className="text-lg font-bold text-green-600">99.8%</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Avg Latency</p>
                    <p className="text-lg font-bold text-blue-600">45ms</p>
                </div>
            </div>
        </div>
    );
}
