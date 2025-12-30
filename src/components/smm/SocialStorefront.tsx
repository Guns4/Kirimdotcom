'use client';

import { useState } from 'react';
import {
    ShoppingCart, Wallet, Check, X, Search,
    TrendingUp, Star, Clock, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
    SOCIAL_PRODUCTS,
    CATEGORIES,
    placeOrder,
    formatPrice,
    type SocialProduct
} from '@/lib/social-store';

export default function SocialStorefront() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<SocialProduct | null>(null);
    const [targetUrl, setTargetUrl] = useState('');
    const [balance] = useState(500000);
    const [processing, setProcessing] = useState(false);

    const categories = Object.entries(CATEGORIES);

    const filteredProducts = selectedCategory
        ? SOCIAL_PRODUCTS.filter(p => p.category === selectedCategory)
        : SOCIAL_PRODUCTS;

    const popularProducts = SOCIAL_PRODUCTS.filter(p => p.popular);

    const handleOrder = async () => {
        if (!selectedProduct) return;
        if (!targetUrl) {
            toast.error('Masukkan link profile/post target');
            return;
        }

        if (balance < selectedProduct.price) {
            toast.error('Saldo tidak cukup', {
                description: 'Silakan top up saldo terlebih dahulu'
            });
            return;
        }

        setProcessing(true);

        // Simulate order processing
        await new Promise(r => setTimeout(r, 1500));

        toast.success('Pesanan berhasil dibuat!', {
            description: `${selectedProduct.name} akan segera diproses`
        });

        setSelectedProduct(null);
        setTargetUrl('');
        setProcessing(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2">Social Store</h1>
                    <p className="text-purple-100">Beli followers & likes semudah beli pulsa!</p>

                    {/* Balance */}
                    <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                        <Wallet className="w-5 h-5" />
                        <span className="font-bold">{formatPrice(balance)}</span>
                        <Button size="sm" variant="secondary" className="ml-2 h-7">
                            Top Up
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Popular Products */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                        Paling Laris
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {popularProducts.map(product => (
                            <Card
                                key={product.id}
                                className={`cursor-pointer transition-all hover:shadow-lg ${selectedProduct?.id === product.id ? 'ring-2 ring-purple-500' : ''
                                    }`}
                                onClick={() => setSelectedProduct(product)}
                            >
                                <CardContent className="py-4 text-center">
                                    <div className="text-3xl mb-2">{product.icon}</div>
                                    <h3 className="font-medium text-sm">{product.name}</h3>
                                    <div className="text-lg font-bold text-purple-600 mt-1">
                                        {formatPrice(product.price)}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Categories */}
                <div className="mb-6 flex gap-2 flex-wrap">
                    <Button
                        variant={selectedCategory === null ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(null)}
                    >
                        Semua
                    </Button>
                    {categories.map(([key, cat]) => (
                        <Button
                            key={key}
                            variant={selectedCategory === key ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(key)}
                            className={selectedCategory === key ? `bg-gradient-to-r ${cat.color}` : ''}
                        >
                            {cat.icon} {cat.name}
                        </Button>
                    ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                    {filteredProducts.map(product => (
                        <Card
                            key={product.id}
                            className={`cursor-pointer transition-all hover:shadow-lg ${selectedProduct?.id === product.id ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                                }`}
                            onClick={() => setSelectedProduct(product)}
                        >
                            <CardContent className="py-4">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">{product.icon}</div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-sm">{product.name}</h3>
                                        <div className="text-lg font-bold text-purple-600">
                                            {formatPrice(product.price)}
                                        </div>
                                    </div>
                                    {selectedProduct?.id === product.id && (
                                        <Check className="w-5 h-5 text-purple-600" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Order Form */}
                {selectedProduct && (
                    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 sticky bottom-4">
                        <CardContent className="py-4">
                            <div className="flex flex-col md:flex-row gap-4 items-center">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="text-3xl">{selectedProduct.icon}</div>
                                    <div>
                                        <h3 className="font-bold">{selectedProduct.name}</h3>
                                        <p className="text-sm text-gray-600">
                                            {selectedProduct.quantity.toLocaleString()} {selectedProduct.type}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 w-full md:w-auto">
                                    <Input
                                        value={targetUrl}
                                        onChange={(e) => setTargetUrl(e.target.value)}
                                        placeholder="Link profile/post target..."
                                        className="bg-white"
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500">Total</div>
                                        <div className="text-xl font-bold text-purple-600">
                                            {formatPrice(selectedProduct.price)}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleOrder}
                                        disabled={processing}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600"
                                    >
                                        {processing ? (
                                            <Clock className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-4 h-4 mr-2" />
                                                Beli
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
