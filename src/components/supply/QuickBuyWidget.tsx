'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ShoppingCart, Package, Plus, Loader2 } from 'lucide-react';
import { MiniCart } from './MiniCart';

export interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category: string;
}

export function QuickBuyWidget() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<Product[]>([]); // Simple local cart
    const [isCartOpen, setIsCartOpen] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        const { data } = await supabase.from('supply_products').select('*').limit(3);
        if (data) setProducts(data);
        setLoading(false);
    }

    function addToCart(product: Product) {
        setCart([...cart, product]);
        setIsCartOpen(true);
    }

    function removeFromCart(index: number) {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    }

    function clearCart() {
        setCart([]);
        setIsCartOpen(false);
    }

    if (loading) return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-48 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 relative">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    Toko Perlengkapan
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsCartOpen(!isCartOpen)}
                        className="relative text-gray-500 hover:text-blue-600 p-1 rounded-md hover:bg-gray-100 transition"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-3.5 h-3.5 flex items-center justify-center rounded-full">
                                {cart.length}
                            </span>
                        )}
                    </button>
                    {/* <span className="text-xs text-blue-600 cursor-pointer hover:underline">Lihat Semua</span> */}
                </div>
            </div>

            <div className="space-y-3">
                {products.map(product => (
                    <div key={product.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                        <div className="relative w-10 h-10 rounded-md bg-gray-100 overflow-hidden border border-gray-200">
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate" title={product.name}>{product.name}</p>
                            <p className="text-xs text-gray-500">Rp {product.price.toLocaleString('id-ID')}</p>
                        </div>
                        <button
                            onClick={() => addToCart(product)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Tambah ke Keranjang"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Mini Cart Overlay */}
            {isCartOpen && (
                <div className="absolute top-12 right-[-20px] z-50">
                    <MiniCart
                        items={cart}
                        onRemove={removeFromCart}
                        onClose={() => setIsCartOpen(false)}
                        onCheckoutSuccess={clearCart}
                    />
                </div>
            )}
        </div>
    );
}
