'use client'

import { useState, useEffect } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
} from 'recharts'
import {
    Search,
    Package,
    TrendingUp,
    Users,
    AlertTriangle,
    RefreshCw,
    Truck
} from 'lucide-react'
import { getAnalytics } from '@/app/actions/analytics'

interface AnalyticsData {
    todaySearches: {
        ongkir: number
        resi: number
        total: number
    }
    topCouriers: { courier: string; count: number }[]
    weeklyTraffic: {
        date: string
        ongkir_count: number
        resi_count: number
        total: number
    }[]
    apiFailureRate: number
    totalUsers: number
    newUsersToday: number
}

export function AnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        setLoading(true)
        try {
            const result = await getAnalytics()
            setData(result)
            setError(null)
        } catch (err) {
            setError('Gagal memuat data analytics')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="glass-card p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                <p className="text-gray-400">{error}</p>
                <button
                    onClick={fetchData}
                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                    Coba Lagi
                </button>
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white">📊 Analytics Dashboard</h2>
                    <p className="text-gray-400 text-sm">Metrik performa real-time</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Pencarian Hari Ini"
                    value={data.todaySearches.total}
                    subtitle={`${data.todaySearches.ongkir} ongkir, ${data.todaySearches.resi} resi`}
                    icon={<Search className="w-5 h-5" />}
                    color="indigo"
                />
                <StatCard
                    title="Total Pengguna"
                    value={data.totalUsers}
                    subtitle={`+${data.newUsersToday} hari ini`}
                    icon={<Users className="w-5 h-5" />}
                    color="purple"
                />
                <StatCard
                    title="API Success Rate"
                    value={`${(100 - data.apiFailureRate).toFixed(1)}%`}
                    subtitle={`${data.apiFailureRate}% error rate`}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="green"
                />
                <StatCard
                    title="Cache Entries"
                    value="-"
                    subtitle="Check Supabase"
                    icon={<Package className="w-5 h-5" />}
                    color="blue"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Traffic Chart */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-white mb-4">
                        📈 Traffic 7 Hari Terakhir
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.weeklyTraffic}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                    }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="ongkir_count"
                                    stroke="#6366F1"
                                    strokeWidth={2}
                                    name="Cek Ongkir"
                                    dot={{ fill: '#6366F1' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="resi_count"
                                    stroke="#8B5CF6"
                                    strokeWidth={2}
                                    name="Cek Resi"
                                    dot={{ fill: '#8B5CF6' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Couriers Chart */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-white mb-4">
                        🚚 Top 5 Kurir Populer
                    </h3>
                    <div className="h-64">
                        {data.topCouriers.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.topCouriers} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                                    <YAxis
                                        type="category"
                                        dataKey="courier"
                                        stroke="#9CA3AF"
                                        fontSize={12}
                                        width={80}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                        }}
                                        labelStyle={{ color: '#fff' }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#6366F1"
                                        radius={[0, 4, 4, 0]}
                                        name="Request"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada data kurir</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Stat Card Component
function StatCard({
    title,
    value,
    subtitle,
    icon,
    color,
}: {
    title: string
    value: string | number
    subtitle: string
    icon: React.ReactNode
    color: 'indigo' | 'purple' | 'green' | 'blue'
}) {
    const colors = {
        indigo: 'bg-indigo-600',
        purple: 'bg-purple-600',
        green: 'bg-green-600',
        blue: 'bg-blue-600',
    }

    return (
        <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${colors[color]} rounded-lg flex items-center justify-center text-white`}>
                    {icon}
                </div>
                <span className="text-sm text-gray-400">{title}</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
    )
}
