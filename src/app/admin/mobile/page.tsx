import { createClient } from '@/utils/supabase/server';
import { BiometricLogin } from '@/components/auth/BiometricLogin'; // Importing for settings usage later
import { Package, Users, Wallet, AlertCircle } from 'lucide-react';

async function getQuickStats() {
    const supabase = await createClient();
    // Simplified stats for mobile
    const { count: orders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    return { orders, users };
}

export default async function MobileDashboard() {
    const stats = await getQuickStats();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                        <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-gray-500 text-xs">Total Orders</p>
                    <p className="text-xl font-bold text-gray-900">{stats.orders || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                        <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-gray-500 text-xs">Total Users</p>
                    <p className="text-xl font-bold text-gray-900">{stats.users || 0}</p>
                </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-5 h-5 text-blue-200" />
                    <span className="text-sm font-medium text-blue-100">Revenue Today</span>
                </div>
                <p className="text-3xl font-bold">Rp 12,500,000</p>
                <div className="mt-4 flex gap-2">
                    <button className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm transition-colors">
                        View Report
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm transition-colors">
                        Withdraw
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    Action Required
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Pending Withdrawals</span>
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">3</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Disputes Open</span>
                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">1</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
