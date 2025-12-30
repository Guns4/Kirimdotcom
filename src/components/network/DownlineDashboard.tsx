'use client';

import { useState, useEffect } from 'react';
import {
    Users, TrendingUp, DollarSign, Share2,
    Copy, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
    getUplineStats,
    type CommissionStats
} from '@/lib/downline-service';

export default function DownlineDashboard() {
    const [stats, setStats] = useState<CommissionStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [referralCode] = useState('BERKAH123'); // Mock

    useEffect(() => {
        loadStats();
    }, []);

    async function loadStats() {
        setLoading(true);
        const data = await getUplineStats('current-user');
        setStats(data);
        setLoading(false);
    }

    const copyReferral = () => {
        navigator.clipboard.writeText(`https://cekkkirim.com/register?ref=${referralCode}`);
        toast.success('Link referral disalin!');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return <div className="p-8 text-center animate-pulse">Loading network data...</div>;
    }

    if (!stats) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-8 h-8 text-blue-600" />
                        Jaringan Reseller
                    </h1>
                    <p className="text-gray-600">Passive Income dari transaksi downline Anda</p>
                </div>

                {/* Referral Link */}
                <Card className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
                    <CardContent className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold mb-1">Kode Referral: {referralCode}</h2>
                            <p className="text-blue-100 text-sm">Bagikan link ini untuk mendapatkan downline otomatis</p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Input
                                value={`https://cekkkirim.com/register?ref=${referralCode}`}
                                readOnly
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                            />
                            <Button variant="secondary" onClick={copyReferral}>
                                <Copy className="w-4 h-4 mr-2" />
                                Salin
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                Total Downline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalDownlines}</div>
                            <p className="text-xs text-gray-500 flex items-center mt-1">
                                <Users className="w-3 h-3 mr-1" />
                                Member aktif
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                Transaksi Hari Ini
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.todayTransactions}</div>
                            <p className="text-xs text-green-600 flex items-center mt-1">
                                <Activity className="w-3 h-3 mr-1" />
                                +12% dari kemarin
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                Komisi Hari Ini
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(stats.todayCommission)}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Rp 25 / transaksi
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                Total Komisi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(stats.totalCommission)}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Sejak bergabung
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity Mock */}
                <Card>
                    <CardHeader>
                        <CardTitle>Aktivitas Jaringan</CardTitle>
                        <CardDescription>Transaksi downline terbaru</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                                            D{i}
                                        </div>
                                        <div>
                                            <div className="font-medium">Downline #{i}</div>
                                            <div className="text-xs text-gray-500">Transaksi Sukses • Pulsa 10k</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-green-600">+Rp 25</div>
                                        <div className="text-xs text-gray-400">Baru saja</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
