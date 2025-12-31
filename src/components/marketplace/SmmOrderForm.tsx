'use client';
import React, { useState, useEffect } from 'react';

// ==========================================
// TypeScript Interfaces
// ==========================================

interface SmmProduct {
    id: string;
    sku: string;
    name: string;
    description?: string;
    category_name: string;
    price_sell: number; // Price per 1000 units
    price_base: number;
    min_order: number;
    max_order: number;
    is_active: boolean;
}

interface OrderItem {
    product_id: string;
    qty: number;
    target_input: {
        link?: string;
        instagram_username?: string;
        tiktok_url?: string;
    };
}

interface SmmOrderFormProps {
    products: SmmProduct[];
    onAddToCart: (item: OrderItem) => void;
}

// ==========================================
// SMM Order Form Component
// ==========================================

export default function SmmOrderForm({ products, onAddToCart }: SmmOrderFormProps) {
    // Filter active products only
    const activeProducts = products.filter((p) => p.is_active);

    // Extract unique categories
    const categories = Array.from(new Set(activeProducts.map((p) => p.category_name))).sort();

    // State management
    const [selectedCategory, setSelectedCategory] = useState(categories[0] || '');
    const [selectedProduct, setSelectedProduct] = useState<SmmProduct | null>(null);
    const [target, setTarget] = useState('');
    const [qty, setQty] = useState<number>(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Filter products by selected category
    const filteredProducts = activeProducts.filter((p) => p.category_name === selectedCategory);

    // Auto-select first product when category changes
    useEffect(() => {
        if (filteredProducts.length > 0) {
            setSelectedProduct(filteredProducts[0]);
            setQty(filteredProducts[0].min_order); // Set to minimum order
        } else {
            setSelectedProduct(null);
            setQty(0);
        }
        setErrors({});
    }, [selectedCategory]);

    // Calculate total price dynamically
    useEffect(() => {
        if (selectedProduct && qty > 0) {
            // SMM pricing formula: (Quantity / 1000) * Price per 1000
            const price = (qty / 1000) * selectedProduct.price_sell;
            setTotalPrice(Math.ceil(price));
        } else {
            setTotalPrice(0);
        }
    }, [qty, selectedProduct]);

    // Validation
    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!selectedProduct) {
            newErrors.product = 'Please select a service';
        }

        if (!target || target.trim().length < 3) {
            newErrors.target = 'Please enter a valid target (username or URL)';
        }

        if (!qty || qty <= 0) {
            newErrors.qty = 'Quantity must be greater than 0';
        } else if (selectedProduct) {
            if (qty < selectedProduct.min_order) {
                newErrors.qty = `Minimum order is ${selectedProduct.min_order}`;
            }
            if (qty > selectedProduct.max_order) {
                newErrors.qty = `Maximum order is ${selectedProduct.max_order.toLocaleString()}`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = () => {
        if (!validate()) return;

        if (selectedProduct) {
            onAddToCart({
                product_id: selectedProduct.id,
                qty: qty,
                target_input: {
                    link: target,
                },
            });

            // Reset form
            setTarget('');
            setQty(selectedProduct.min_order);
            setErrors({});
        }
    };

    // Calculate profit margin
    const profitMargin = selectedProduct
        ? ((selectedProduct.price_sell - selectedProduct.price_base) / selectedProduct.price_base) * 100
        : 0;

    if (activeProducts.length === 0) {
        return (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No SMM Services Available</h3>
                <p className="text-gray-600 mb-4">
                    Services will appear here after admin syncs with provider
                </p>
                <p className="text-sm text-gray-500">Contact admin to enable SMM services</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100">
            <div className="flex items-center mb-6">
                <div className="text-4xl mr-3">🚀</div>
                <div>
                    <h3 className="text-2xl font-bold text-blue-800">SMM Booster</h3>
                    <p className="text-sm text-gray-600">Instant social media growth</p>
                </div>
            </div>

            {/* 1. Category Selection */}
            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📱 Select Category
                </label>
                <select
                    className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            {/* 2. Service Selection */}
            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ⚡ Choose Service
                </label>
                <select
                    className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    value={selectedProduct?.id || ''}
                    onChange={(e) => {
                        const prod = activeProducts.find((p) => p.id === e.target.value);
                        setSelectedProduct(prod || null);
                        if (prod) setQty(prod.min_order);
                    }}
                >
                    {filteredProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name} — Rp {p.price_sell.toLocaleString()}/1K
                        </option>
                    ))}
                </select>

                {selectedProduct && (
                    <div className="mt-2 flex items-center justify-between text-xs">
                        <div className="text-gray-600">
                            <span className="font-semibold">Min:</span> {selectedProduct.min_order.toLocaleString()} |{' '}
                            <span className="font-semibold">Max:</span> {selectedProduct.max_order.toLocaleString()}
                        </div>
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">
                            {profitMargin.toFixed(0)}% profit
                        </div>
                    </div>
                )}

                {selectedProduct?.description && (
                    <p className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        ℹ️ {selectedProduct.description}
                    </p>
                )}
            </div>

            {/* 3. Target Input */}
            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🎯 Target (Username or URL)
                </label>
                <input
                    type="text"
                    className={`w-full border-2 p-3 rounded-lg focus:outline-none transition-colors ${errors.target ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                        }`}
                    placeholder="@username or https://instagram.com/username"
                    value={target}
                    onChange={(e) => {
                        setTarget(e.target.value);
                        if (errors.target) setErrors({ ...errors, target: '' });
                    }}
                />
                {errors.target && <p className="mt-1 text-xs text-red-600">⚠️ {errors.target}</p>}
                <p className="mt-1 text-xs text-gray-500">
                    💡 Public account links work best. Make sure profile is not private.
                </p>
            </div>

            {/* 4. Quantity Input */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🔢 Quantity
                </label>
                <input
                    type="number"
                    className={`w-full border-2 p-3 rounded-lg focus:outline-none transition-colors ${errors.qty ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                        }`}
                    placeholder={selectedProduct ? `Min: ${selectedProduct.min_order}` : '1000'}
                    value={qty || ''}
                    min={selectedProduct?.min_order || 100}
                    max={selectedProduct?.max_order || 100000}
                    onChange={(e) => {
                        setQty(parseInt(e.target.value) || 0);
                        if (errors.qty) setErrors({ ...errors, qty: '' });
                    }}
                />
                {errors.qty && <p className="mt-1 text-xs text-red-600">⚠️ {errors.qty}</p>}

                {selectedProduct && qty > 0 && !errors.qty && (
                    <div className="mt-2 text-xs text-gray-600 bg-blue-50 p-2 rounded">
                        💵 Price calculation: {qty} ÷ 1,000 × Rp {selectedProduct.price_sell.toLocaleString()} = Rp{' '}
                        {totalPrice.toLocaleString()}
                    </div>
                )}
            </div>

            {/* Total Price Display */}
            <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg mb-4 border-2 border-blue-200">
                <div>
                    <span className="text-sm text-gray-600">Total Payment</span>
                    {selectedProduct && (
                        <p className="text-xs text-gray-500">
                            Est. delivery: 1-24 hours
                        </p>
                    )}
                </div>
                <span className="text-2xl font-bold text-blue-700">
                    Rp {totalPrice.toLocaleString()}
                </span>
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={!selectedProduct || qty < (selectedProduct?.min_order || 0) || !target}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
                {!target || qty === 0
                    ? '📝 Fill in all fields'
                    : qty < (selectedProduct?.min_order || 0)
                        ? `❌ Minimum ${selectedProduct?.min_order}`
                        : '🛒 ADD TO CART'}
            </button>

            {/* Information Footer */}
            <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <p className="font-semibold mb-1">ℹ️ Important Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Orders are processed automatically within 1-24 hours</li>
                    <li>Make sure your account is public for best results</li>
                    <li>Refunds available if service fails (provider issue)</li>
                    <li>Contact support if you need help</li>
                </ul>
            </div>
        </div>
    );
}

// ==========================================
// Export Component
// ==========================================

export type { SmmProduct, OrderItem, SmmOrderFormProps };
