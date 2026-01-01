'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Settings,
    TrendingUp,
    Package,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

export default function AdminDashboardPage() {
    const [activeMenu, setActiveMenu] = useState('dashboard');

    // Dummy data
    const stats = [
        {
            title: 'Total Users',
            value: '12,345',
            change: '+12.5%',
            trend: 'up' as const,
            icon: Users,
            color: 'bg-blue-500'
        },
        {
            title: 'Revenue',
            value: 'Rp 125M',
            change: '+8.2%',
            trend: 'up' as const,
            icon: DollarSign,
            color: 'bg-green-500'
        },
        {
            title: 'Active Orders',
            value: '1,234',
            change: '-3.1%',
            trend: 'down' as const,
            icon: Package,
            color: 'bg-orange-500'
        },
        {
            title: 'Transactions',
            value: '45,678',
            change: '+15.3%',
            trend: 'up' as const,
            icon: CreditCard,
            color: 'bg-purple-500'
        },
    ];

    const recentTransactions = [
        { id: 'TRX001', customer: 'John Doe', amount: 'Rp 150,000', status: 'Completed', date: '2026-01-01' },
        { id: 'TRX002', customer: 'Jane Smith', amount: 'Rp 250,000', status: 'Pending', date: '2026-01-01' },
        { id: 'TRX003', customer: 'Bob Johnson', amount: 'Rp 180,000', status: 'Completed', date: '2025-12-31' },
        { id: 'TRX004', customer: 'Alice Brown', amount: 'Rp 320,000', status: 'Failed', date: '2025-12-31' },
        { id: 'TRX005', customer: 'Charlie Wilson', amount: 'Rp 95,000', status: 'Completed', date: '2025-12-30' },
    ];

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { id: 'users', label: 'Users', icon: Users, href: '/admin/users' },
        { id: 'transactions', label: 'Transactions', icon: CreditCard, href: '/admin/transactions' },
        { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-800">CekKirim</h1>
                    <p className="text-sm text-gray-500">Admin Panel</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeMenu === item.id;
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                onClick={() => setActiveMenu(item.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800">Admin User</p>
                            <p className="text-xs text-gray-500">admin@cekkirim.com</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-8 py-6">
                    <h2 className="text-3xl font-bold text-gray-800">Welcome Back, Admin!</h2>
                    <p className="text-gray-600 mt-1">Here&apos;s what&apos;s happening with your platform today.</p>
                </header>

                {/* Content */}
                <div className="p-8 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
                            return (
                                <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                                            <Icon className="text-white" size={24} />
                                        </div>
                                        <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            <TrendIcon size={16} />
                                            {stat.change}
                                        </div>
                                    </div>
                                    <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Recent Transactions Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800">Recent Transactions</h3>
                            <p className="text-sm text-gray-600 mt-1">Last 5 transactions across the platform</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Transaction ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentTransactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {transaction.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {transaction.customer}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                {transaction.amount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${transaction.status === 'Completed'
                                                            ? 'bg-green-100 text-green-700'
                                                            : transaction.status === 'Pending'
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    {transaction.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {transaction.date}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link
                            href="/admin/dashboard"
                            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow"
                        >
                            <TrendingUp size={32} className="mb-3" />
                            <h4 className="text-lg font-bold">View Analytics</h4>
                            <p className="text-sm text-blue-100 mt-1">Deep dive into platform metrics</p>
                        </Link>
                        <Link
                            href="/admin/users"
                            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow"
                        >
                            <Users size={32} className="mb-3" />
                            <h4 className="text-lg font-bold">Manage Users</h4>
                            <p className="text-sm text-purple-100 mt-1">View and moderate user accounts</p>
                        </Link>
                        <Link
                            href="/admin/transactions"
                            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow"
                        >
                            <CreditCard size={32} className="mb-3" />
                            <h4 className="text-lg font-bold">Transactions</h4>
                            <p className="text-sm text-green-100 mt-1">Monitor all payments and orders</p>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
