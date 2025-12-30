'use client';

import { useState } from 'react';
import {
    Bot, Zap, MessageSquare, Shield, Crown,
    Check, X, ChevronRight, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    features: string[];
    autoReplyQuota: number;
    broadcastQuota: number;
    recommended?: boolean;
}

const PLANS: SubscriptionPlan[] = [
    {
        id: 'FREE',
        name: 'Free',
        price: 0,
        features: ['Manual reply only', 'Basic tracking'],
        autoReplyQuota: 0,
        broadcastQuota: 0
    },
    {
        id: 'BASIC',
        name: 'Basic',
        price: 50000,
        features: ['100 auto-reply/hari', '500 broadcast/bulan', 'Tracking status'],
        autoReplyQuota: 100,
        broadcastQuota: 500
    },
    {
        id: 'PREMIUM',
        name: 'Premium',
        price: 150000,
        features: ['1000 auto-reply/hari', '5000 broadcast/bulan', 'Priority support', 'Analytics'],
        autoReplyQuota: 1000,
        broadcastQuota: 5000,
        recommended: true
    },
    {
        id: 'ENTERPRISE',
        name: 'Enterprise',
        price: 500000,
        features: ['Unlimited auto-reply', 'Unlimited broadcast', 'Custom integrations', 'Dedicated support'],
        autoReplyQuota: -1,
        broadcastQuota: -1
    }
];

export default function WAAutoReplySettings() {
    const [currentPlan] = useState('PREMIUM');
    const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
    const [usageToday] = useState(150);
    const [quotaTotal] = useState(1000);

    const handleToggleAutoReply = async (enabled: boolean) => {
        setAutoReplyEnabled(enabled);
        toast.success(enabled ? 'Auto-reply diaktifkan' : 'Auto-reply dinonaktifkan');
    };

    const formatPrice = (price: number) => {
        if (price === 0) return 'Gratis';
        return `Rp ${price.toLocaleString('id-ID')}/bulan`;
    };

    return (
        <div className="space-y-6">
            {/* Current Status */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Crown className="w-5 h-5 text-green-600" />
                                <span className="font-bold text-green-800">
                                    Paket {PLANS.find(p => p.id === currentPlan)?.name}
                                </span>
                            </div>
                            <p className="text-sm text-green-700">
                                Auto-reply: {usageToday}/{quotaTotal} hari ini
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-green-700">
                                {Math.round((usageToday / quotaTotal) * 100)}%
                            </div>
                            <div className="text-xs text-green-600">Kuota terpakai</div>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-4 h-2 bg-green-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: `${(usageToday / quotaTotal) * 100}%` }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Auto-Reply Toggle */}
            <Card>
                <CardContent className="py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Bot className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-medium">Auto-Reply Bot</h3>
                                <p className="text-sm text-gray-500">
                                    Otomatis balas pesan berisi nomor resi
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={autoReplyEnabled}
                            onCheckedChange={handleToggleAutoReply}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Resi Patterns Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Format Resi yang Dikenali
                    </CardTitle>
                    <CardDescription>
                        Bot otomatis mendeteksi nomor resi dari berbagai kurir
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { name: 'JNE', example: 'JP1234567890' },
                            { name: 'J&T', example: '000123456789' },
                            { name: 'SiCepat', example: 'SC12345678' },
                            { name: 'Anteraja', example: '1000123456' },
                            { name: 'Ninja', example: 'NVID12345' },
                            { name: 'POS', example: 'CN12345678' },
                            { name: 'Wahana', example: 'AGK1234567' },
                            { name: 'Lion', example: 'LEX1234567' },
                        ].map(courier => (
                            <div key={courier.name} className="bg-gray-50 rounded-lg p-3 text-center">
                                <div className="font-medium text-sm">{courier.name}</div>
                                <div className="text-xs text-gray-500 font-mono">{courier.example}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Upgrade Plans */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Pilih Paket</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {PLANS.map(plan => (
                            <div
                                key={plan.id}
                                className={`relative rounded-xl border-2 p-4 transition-all ${currentPlan === plan.id
                                        ? 'border-green-500 bg-green-50'
                                        : plan.recommended
                                            ? 'border-blue-300 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                {plan.recommended && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                        Recommended
                                    </div>
                                )}
                                {currentPlan === plan.id && (
                                    <div className="absolute -top-3 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                        Aktif
                                    </div>
                                )}
                                <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                                <div className="text-2xl font-bold mb-3">
                                    {formatPrice(plan.price)}
                                </div>
                                <ul className="space-y-2 mb-4">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-sm">
                                            <Check className="w-4 h-4 text-green-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    className="w-full"
                                    variant={currentPlan === plan.id ? 'outline' : 'default'}
                                    disabled={currentPlan === plan.id}
                                >
                                    {currentPlan === plan.id ? 'Paket Aktif' : 'Pilih Paket'}
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
