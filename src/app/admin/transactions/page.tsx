import { requireAdmin } from '@/lib/adminAuth';
import { getAllPayments, getAllUsers } from '@/app/actions/adminTransactionActions';
import { DollarSign, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Admin - Transactions & Users | CekKirim',
    description: 'Manage transactions and users',
};

async function getAdminTransactionData() {
    await requireAdmin();

    const { data: payments } = await getAllPayments();
    const { data: users } = await getAllUsers();

    return { payments: payments || [], users: users || [] };
}

export default async function AdminTransactionsPage() {
    const { payments, users } = await getAdminTransactionData();

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const pendingPayments = payments.filter((p: any) => p.status === 'pending');
    const totalRevenue = payments
        .filter((p: any) => p.status === 'confirmed')
        .reduce((sum: number, p: any) => sum + p.amount, 0);
    const premiumUsers = users.filter((u: any) => u.user_subscriptions?.is_premium).length;

    return (
        <main className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Transactions & User Management
                    </h1>
                    <p className="text-gray-600">Approve payments and manage user access</p>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Pending Payments</p>
                                <p className="text-2xl font-bold text-gray-900">{pendingPayments.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Premium Users</p>
                                <p className="text-2xl font-bold text-gray-900">{premiumUsers}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Payments Alert */}
                {pendingPayments.length > 0 && (
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-8">
                        <h2 className="text-xl font-bold text-yellow-900 mb-4">
                            ⚠️ {pendingPayments.length} Payment(s) Awaiting Approval
                        </h2>
                        <p className="text-yellow-800 text-sm">
                            Review and approve manual transfer payments below
                        </p>
                    </div>
                )}

                {/* Transactions Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
                        <div className="flex gap-2">
                            <Link
                                href="/admin/transactions?filter=pending"
                                className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded hover:bg-yellow-200 transition"
                            >
                                Pending
                            </Link>
                            <Link
                                href="/admin/transactions?filter=confirmed"
                                className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded hover:bg-green-200 transition"
                            >
                                Confirmed
                            </Link>
                            <Link
                                href="/admin/transactions" className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-semibold rounded hover:bg-gray-200 transition"
                            >
                                All
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {payments.map((payment: any) => (
                                    <tr key={payment.id}>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {payment.user_id.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                                                {payment.plan_code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                            {formatPrice(payment.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {payment.payment_method || 'Manual'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {formatDate(payment.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded ${payment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {payment.status === 'confirmed' && <CheckCircle className="w-3 h-3" />}
                                                {payment.status === 'pending' && <Clock className="w-3 h-3" />}
                                                {payment.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {payment.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <form action={() => { }}>
                                                        <button className="text-green-600 hover:text-green-800 text-sm font-semibold">
                                                            Approve
                                                        </button>
                                                    </form>
                                                    <button className="text-red-600 hover:text-red-800 text-sm font-semibold">
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* User Management */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                            <input
                                type="search"
                                placeholder="Search by email..."
                                className="px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.slice(0, 20).map((user: any) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${user.user_subscriptions?.is_premium
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {user.user_subscriptions?.plan_type || 'FREE'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${user.is_banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {user.is_banned ? 'Banned' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="text-yellow-600 hover:text-yellow-800 text-sm font-semibold">
                                                    Grant Premium
                                                </button>
                                                <button className="text-red-600 hover:text-red-800 text-sm font-semibold">
                                                    {user.is_banned ? 'Unban' : 'Ban'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
