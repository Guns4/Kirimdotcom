'use client';

import { useState, useEffect } from 'react';
import {
    Search, ShoppingCart, TrendingUp, Star,
    Instagram, Youtube, Music, Users, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
    formatPrice,
    calculateOrderTotal,
    getCategoryIcon,
    type SMMService
} from '@/lib/smm-integration';

// Mock services for demo
const MOCK_SERVICES: SMMService[] = [
    {
        id: '1',
        providerId: 'p1',
        providerServiceId: '101',
        name: 'Instagram Followers Mix',
        category: 'Instagram Followers',
        description: 'High quality mixed followers',
        providerPrice: 5000,
        markupPercent: 50,
        sellPrice: 7500,
        minQuantity: 100,
        maxQuantity: 10000,
        isActive: true
    },
    {
        id: '2',
        providerId: 'p1',
        providerServiceId: '102',
        name: 'Instagram Likes Real',
        category: 'Instagram Likes',
        providerPrice: 3000,
        markupPercent: 50,
        sellPrice: 4500,
        minQuantity: 50,
        maxQuantity: 5000,
        isActive: true
    },
    {
        id: '3',
        providerId: 'p1',
        providerServiceId: '201',
        name: 'TikTok Followers',
        category: 'TikTok',
        providerPrice: 8000,
        markupPercent: 50,
        sellPrice: 12000,
        minQuantity: 100,
        maxQuantity: 50000,
        isActive: true
    },
    {
        id: '4',
        providerId: 'p1',
        providerServiceId: '301',
        name: 'YouTube Views',
        category: 'YouTube',
        providerPrice: 15000,
        markupPercent: 50,
        sellPrice: 22500,
        minQuantity: 500,
        maxQuantity: 100000,
        isActive: true
    },
];

export default function SMMServiceCatalog() {
    const [services, setServices] = useState<SMMService[]>(MOCK_SERVICES);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedService, setSelectedService] = useState<SMMService | null>(null);
    const [quantity, setQuantity] = useState(1000);
    const [targetUrl, setTargetUrl] = useState('');

    const categories = [...new Set(services.map(s => s.category))];

    const filteredServices = services.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || s.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleOrder = async () => {
        if (!selectedService) return;
        if (!targetUrl) {
            toast.error('Masukkan URL/username target');
            return;
        }
        if (quantity < selectedService.minQuantity) {
            toast.error(`Minimum order: ${selectedService.minQuantity}`);
            return;
        }

        const total = calculateOrderTotal(quantity, selectedService.sellPrice);

        // In production: Call API to create order
        toast.success('Order berhasil dibuat!', {
            description: `${quantity.toLocaleString()} ${selectedService.name} - ${formatPrice(total)}`
        });

        setSelectedService(null);
        setTargetUrl('');
    };

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0">
                    <CardContent className="py-4">
                        <div className="text-3xl font-bold">{services.length}</div>
                        <div className="text-sm opacity-90">Layanan Aktif</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0">
                    <CardContent className="py-4">
                        <div className="text-3xl font-bold">{categories.length}</div>
                        <div className="text-sm opacity-90">Kategori</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                    <CardContent className="py-4">
                        <div className="text-3xl font-bold">50%</div>
                        <div className="text-sm opacity-90">Markup Profit</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                    <CardContent className="py-4">
                        <div className="text-3xl font-bold">Auto</div>
                        <div className="text-sm opacity-90">Sync Provider</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari layanan..."
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={selectedCategory === null ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(null)}
                    >
                        Semua
                    </Button>
                    {categories.slice(0, 4).map(cat => (
                        <Button
                            key={cat}
                            variant={selectedCategory === cat ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {getCategoryIcon(cat)} {cat.split(' ')[0]}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map(service => (
                    <Card
                        key={service.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${selectedService?.id === service.id ? 'ring-2 ring-blue-500' : ''
                            }`}
                        onClick={() => setSelectedService(service)}
                    >
                        <CardContent className="py-4">
                            <div className="flex items-start gap-3">
                                <div className="text-2xl">{getCategoryIcon(service.category)}</div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-sm">{service.name}</h3>
                                    <p className="text-xs text-gray-500">{service.category}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <div>
                                            <div className="text-lg font-bold text-blue-600">
                                                {formatPrice(service.sellPrice)}
                                            </div>
                                            <div className="text-xs text-gray-400 line-through">
                                                {formatPrice(service.providerPrice)}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            per 1K
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        Min: {service.minQuantity.toLocaleString()} | Max: {service.maxQuantity.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Order Form */}
            {selectedService && (
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">
                            {getCategoryIcon(selectedService.category)} {selectedService.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">URL / Username Target</label>
                            <Input
                                value={targetUrl}
                                onChange={(e) => setTargetUrl(e.target.value)}
                                placeholder="https://instagram.com/username"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Jumlah</label>
                            <Input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                min={selectedService.minQuantity}
                                max={selectedService.maxQuantity}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Min: {selectedService.minQuantity.toLocaleString()} - Max: {selectedService.maxQuantity.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Pembayaran</span>
                                <span className="text-2xl font-bold text-blue-600">
                                    {formatPrice(calculateOrderTotal(quantity, selectedService.sellPrice))}
                                </span>
                            </div>
                        </div>
                        <Button className="w-full" onClick={handleOrder}>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Buat Pesanan
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
