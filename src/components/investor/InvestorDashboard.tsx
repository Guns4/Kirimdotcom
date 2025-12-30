'use client';

import { useState, useEffect } from 'react';
import {
    TrendingUp, Users, DollarSign, Target,
    ArrowUpRight, ArrowDownRight, Zap, Clock,
    PieChart as PieChartIcon, BarChart3, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    getInvestorMetrics,
    getMonthlyGrowthData,
    getUserAcquisitionData,
    formatCurrency,
    formatNumber,
    type InvestorMetrics
} from '@/lib/investor-metrics';
import InvestorGate from './InvestorGate';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function InvestorDashboard() {
    const [authenticated, setAuthenticated] = useState(false);
    const [metrics, setMetrics] = useState<InvestorMetrics | null>(null);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [acquisitionData, setAcquisitionData] = useState<any[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    useEffect(() => {
        // Check session
        if (sessionStorage.getItem('investor_authenticated') === 'true') {
            setAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        if (authenticated) {
            loadData();
        }
    }, [authenticated]);

    const loadData = () => {
        setMetrics(getInvestorMetrics());
        setMonthlyData(getMonthlyGrowthData());
        setAcquisitionData(getUserAcquisitionData());
        setLastUpdated(new Date());
    };

    if (!authenticated) {
        return <InvestorGate onAuthenticated={() => setAuthenticated(true)} />;
    }

    if (!metrics) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">CekKirim Investor Portal</h1>
                        <p className="text-slate-400 mt-1">Live Business Metrics • Confidential</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-slate-400 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Updated: {lastUpdated.toLocaleTimeString()}
                        </div>
                        <Button variant="outline" size="sm" onClick={loadData} className="border-slate-600">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            {/* North Star Metrics */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* GMV */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm">GMV (Monthly)</span>
                            <DollarSign className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="text-3xl font-bold">Rp {metrics.gmv.current / 1000}M</div>
                        <div className="flex items-center gap-1 mt-2">
                            <ArrowUpRight className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-sm">+{metrics.gmv.growth.toFixed(1)}%</span>
                            <span className="text-slate-500 text-xs ml-1">vs last month</span>
                        </div>
                    </CardContent>
                </Card>

                {/* MAU */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm">MAU</span>
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold">{formatNumber(metrics.mau.current)}</div>
                        <div className="flex items-center gap-1 mt-2">
                            <ArrowUpRight className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-sm">+{metrics.mau.growth.toFixed(1)}%</span>
                            <span className="text-slate-500 text-xs ml-1">MoM growth</span>
                        </div>
                    </CardContent>
                </Card>

                {/* LTV/CAC Ratio */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm">LTV:CAC Ratio</span>
                            <Target className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold">{metrics.ltvCacRatio.toFixed(1)}x</div>
                        <div className="flex items-center gap-1 mt-2">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span className="text-slate-400 text-sm">
                                LTV: {formatCurrency(metrics.ltv)} | CAC: {formatCurrency(metrics.cac)}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Runway */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm">Runway</span>
                            <TrendingUp className="w-5 h-5 text-orange-400" />
                        </div>
                        <div className="text-3xl font-bold">{metrics.runway} months</div>
                        <div className="flex items-center gap-1 mt-2">
                            <span className="text-slate-400 text-sm">
                                Burn: Rp {metrics.burnRate}Jt/mo
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* GMV Growth Chart */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BarChart3 className="w-5 h-5 text-green-400" />
                            GMV Growth (6 Months)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="gmvGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="month" stroke="#94A3B8" />
                                <YAxis stroke="#94A3B8" tickFormatter={(v) => `${v}Jt`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
                                    formatter={(value: any) => [`Rp ${value} Juta`, 'GMV']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="gmv"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    fill="url(#gmvGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* User Growth Chart */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Users className="w-5 h-5 text-blue-400" />
                            User Growth (6 Months)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="month" stroke="#94A3B8" />
                                <YAxis stroke="#94A3B8" tickFormatter={(v) => `${v / 1000}K`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
                                    formatter={(value: any) => [formatNumber(value), 'Users']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="users"
                                    stroke="#3B82F6"
                                    strokeWidth={3}
                                    dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Revenue Chart */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <DollarSign className="w-5 h-5 text-purple-400" />
                            Revenue (6 Months)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="month" stroke="#94A3B8" />
                                <YAxis stroke="#94A3B8" tickFormatter={(v) => `${v}Jt`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
                                    formatter={(value: any) => [`Rp ${value} Juta`, 'Revenue']}
                                />
                                <Bar dataKey="revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* User Acquisition */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <PieChartIcon className="w-5 h-5 text-orange-400" />
                            User Acquisition Channels
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={acquisitionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="users"
                                    nameKey="channel"
                                    label={({ channel, percent }) => `${channel} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {acquisitionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
                                    formatter={(value: any) => [formatNumber(value), 'Users']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* MoM Highlights */}
            <div className="max-w-7xl mx-auto">
                <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
                    <CardContent className="py-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div>
                                <div className="text-sm text-slate-300 mb-1">Revenue MoM</div>
                                <div className="text-3xl font-bold text-green-400">+{metrics.mom.revenue}%</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-300 mb-1">Users MoM</div>
                                <div className="text-3xl font-bold text-blue-400">+{metrics.mom.users}%</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-300 mb-1">Transactions MoM</div>
                                <div className="text-3xl font-bold text-purple-400">+{metrics.mom.transactions}%</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Footer */}
            <div className="max-w-7xl mx-auto mt-8 text-center text-slate-500 text-sm">
                <p>CekKirim Confidential • Data refreshes in real-time</p>
                <p className="mt-1">For investor inquiries: investor@cekkirim.com</p>
            </div>
        </div>
    );
}
