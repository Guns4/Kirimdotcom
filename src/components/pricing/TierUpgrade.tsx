'use client';

import { useState } from 'react';
import {
    Check, Crown, Star, Shield,
    ArrowRight, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    TIER_CONFIG,
    upgradeAccount,
    type AccountLevel
} from '@/lib/tier-pricing';

export default function TierUpgrade() {
    const [currentLevel, setCurrentLevel] = useState<AccountLevel>('BASIC');
    const [processing, setProcessing] = useState(false);

    const handleUpgrade = async (level: AccountLevel) => {
        setProcessing(true);
        try {
            // Simulate API call
            await new Promise(r => setTimeout(r, 1500));
            const result = await upgradeAccount('current-user', level);

            if (result.success) {
                toast.success(`Berhasil upgrade ke ${TIER_CONFIG[level].name}!`);
                setCurrentLevel(level);
            } else {
                toast.error('Gagal upgrade: ' + result.error);
            }
        } catch (error) {
            toast.error('Terjadi kesalahan');
        } finally {
            setProcessing(false);
        }
    };

    const formatPrice = (price?: number) => {
        if (!price) return 'Gratis';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Upgrade Akun Anda</h1>
                    <p className="text-xl text-gray-600">Dapatkan harga modal termurah dengan paket Reseller & VIP</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* BASIC */}
                    <Card className={`border-2 ${currentLevel === 'BASIC' ? 'border-gray-400 bg-gray-50' : 'border-gray-200'}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-6 h-6 text-gray-500" />
                                {TIER_CONFIG.BASIC.name}
                            </CardTitle>
                            <CardDescription>Untuk pengguna kasual</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold mb-6">Gratis</div>
                            <ul className="space-y-3 mb-8">
                                {TIER_CONFIG.BASIC.benefits.map((benefit, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                        <Check className="w-4 h-4 text-green-500" />
                                        {benefit}
                                    </li>
                                ))}
                                <li className="flex items-center gap-2 text-sm text-gray-600">
                                    <Check className="w-4 h-4 text-green-500" />
                                    Markup Harga +Rp 1.000
                                </li>
                            </ul>
                            <Button
                                className="w-full"
                                variant="outline"
                                disabled={true}
                            >
                                {currentLevel === 'BASIC' ? 'Paket Saat Ini' : 'Downgrade'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* RESELLER */}
                    <Card className={`border-2 relative ${currentLevel === 'RESELLER' ? 'border-blue-500 bg-blue-50' : 'border-blue-200 shadow-lg scale-105'}`}>
                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-sm">
                            POPULAR
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-700">
                                <Zap className="w-6 h-6" />
                                {TIER_CONFIG.RESELLER.name}
                            </CardTitle>
                            <CardDescription>Pilihan terbaik untuk mulai jualan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold mb-1">{formatPrice(TIER_CONFIG.RESELLER.price)}</div>
                            <div className="text-sm text-gray-500 mb-6">Sekali bayar, aktif selamanya</div>

                            <ul className="space-y-3 mb-8">
                                {TIER_CONFIG.RESELLER.benefits.map((benefit, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                        <Check className="w-4 h-4 text-blue-500" />
                                        {benefit}
                                    </li>
                                ))}
                                <li className="flex items-center gap-2 text-sm text-green-600 font-bold">
                                    <Check className="w-4 h-4" />
                                    Hemat Rp 800 per transaksi
                                </li>
                            </ul>
                            <Button
                                className={`w-full ${currentLevel === 'RESELLER' ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 hover:bg-blue-700'}`}
                                onClick={() => handleUpgrade('RESELLER')}
                                disabled={currentLevel === 'RESELLER' || currentLevel === 'VIP' || processing}
                            >
                                {currentLevel === 'RESELLER' ? 'Paket Saat Ini' : 'Daftar Reseller'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* VIP */}
                    <Card className={`border-2 ${currentLevel === 'VIP' ? 'border-yellow-500 bg-yellow-50' : 'border-yellow-200'}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-yellow-700">
                                <Crown className="w-6 h-6" />
                                {TIER_CONFIG.VIP.name}
                            </CardTitle>
                            <CardDescription>Untuk pedagang volume besar</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold mb-1">{formatPrice(TIER_CONFIG.VIP.price)}</div>
                            <div className="text-sm text-gray-500 mb-6">Sekali bayar, aktif selamanya</div>

                            <ul className="space-y-3 mb-8">
                                {TIER_CONFIG.VIP.benefits.map((benefit, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                        <Check className="w-4 h-4 text-yellow-500" />
                                        {benefit}
                                    </li>
                                ))}
                                <li className="flex items-center gap-2 text-sm text-green-600 font-bold">
                                    <Check className="w-4 h-4" />
                                    Hemat Rp 950 per transaksi
                                </li>
                            </ul>
                            <Button
                                className={`w-full ${currentLevel === 'VIP' ? 'bg-gray-200 text-gray-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'}`}
                                onClick={() => handleUpgrade('VIP')}
                                disabled={currentLevel === 'VIP' || processing}
                            >
                                {currentLevel === 'VIP' ? 'Paket Saat Ini' : 'Gabung VIP'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Example Comparison */}
                <div className="mt-16 bg-white rounded-xl p-8 shadow-sm border">
                    <h3 className="text-xl font-bold mb-6 text-center">Simulasi Keuntungan</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-center">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-4 text-left">Produk (Contoh)</th>
                                    <th className="py-4 text-gray-500">Harga Modal</th>
                                    <th className="py-4 font-bold text-gray-700">Harga Basic</th>
                                    <th className="py-4 font-bold text-blue-600">Harga Reseller</th>
                                    <th className="py-4 font-bold text-yellow-600">Harga VIP</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="py-4 text-left text-sm font-medium">Pulsa 10.000</td>
                                    <td className="py-4 text-gray-500">Rp 9.800</td>
                                    <td className="py-4">Rp 10.800</td>
                                    <td className="py-4 font-bold">Rp 10.000</td>
                                    <td className="py-4 font-bold text-green-600">Rp 9.850</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-4 text-left text-sm font-medium">Token PLN 50.000</td>
                                    <td className="py-4 text-gray-500">Rp 50.000</td>
                                    <td className="py-4">Rp 51.000</td>
                                    <td className="py-4 font-bold">Rp 50.200</td>
                                    <td className="py-4 font-bold text-green-600">Rp 50.050</td>
                                </tr>
                                <tr>
                                    <td className="py-4 text-left text-sm font-medium">1000 Followers IG</td>
                                    <td className="py-4 text-gray-500">Rp 10.000</td>
                                    <td className="py-4">Rp 11.000</td>
                                    <td className="py-4 font-bold">Rp 10.200</td>
                                    <td className="py-4 font-bold text-green-600">Rp 10.050</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
