import { TrendingUp, DollarSign } from 'lucide-react';

export function ProfitCard({ amount }: { amount: number }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-500">Revenue Today</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">
                    Rp {amount.toLocaleString('id-ID')}
                </h3>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-600 font-medium">
                    <TrendingUp className="w-4 h-4" />
                    <span>+12.5% vs Yesterday</span>
                </div>
            </div>
        </div>
    );
}
