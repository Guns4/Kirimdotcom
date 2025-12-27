'use client';

import { useState } from 'react';
import { Smartphone, Zap, ChevronRight } from 'lucide-react';

// Operator detection based on prefix
const detectOperator = (phone: string): string | null => {
    const prefixes = {
        telkomsel: ['0811', '0812', '0813', '0821', '0822', '0823', '0852', '0853'],
        indosat: ['0814', '0815', '0816', '0855', '0856', '0857', '0858'],
        xl: ['0817', '0818', '0819', '0859', '0877', '0878'],
        tri: ['0895', '0896', '0897', '0898', '0899'],
        smartfren: ['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888', '0889'],
    };

    const cleanPhone = phone.replace(/\D/g, '');

    for (const [operator, prefixList] of Object.entries(prefixes)) {
        if (prefixList.some(prefix => cleanPhone.startsWith(prefix))) {
            return operator;
        }
    }

    return null;
};

const products = {
    telkomsel: [
        { id: 1, nominal: 5000, price: 6000, label: '5K' },
        { id: 2, nominal: 10000, price: 11000, label: '10K' },
        { id: 3, nominal: 20000, price: 20500, label: '20K' },
        { id: 4, nominal: 25000, price: 25500, label: '25K' },
        { id: 5, nominal: 50000, price: 50500, label: '50K' },
        { id: 6, nominal: 100000, price: 100500, label: '100K' },
    ],
    indosat: [
        { id: 7, nominal: 5000, price: 5500, label: '5K' },
        { id: 8, nominal: 10000, price: 10500, label: '10K' },
        { id: 9, nominal: 25000, price: 25500, label: '25K' },
        { id: 10, nominal: 50000, price: 50500, label: '50K' },
        { id: 11, nominal: 100000, price: 100500, label: '100K' },
    ],
    xl: [
        { id: 12, nominal: 5000, price: 6000, label: '5K' },
        { id: 13, nominal: 10000, price: 11000, label: '10K' },
        { id: 14, nominal: 25000, price: 25500, label: '25K' },
        { id: 15, nominal: 50000, price: 50500, label: '50K' },
        { id: 16, nominal: 100000, price: 100500, label: '100K' },
    ],
    tri: [
        { id: 17, nominal: 5000, price: 5200, label: '5K' },
        { id: 18, nominal: 10000, price: 10200, label: '10K' },
        { id: 19, nominal: 20000, price: 20200, label: '20K' },
        { id: 20, nominal: 50000, price: 50200, label: '50K' },
    ],
    smartfren: [
        { id: 21, nominal: 5000, price: 5500, label: '5K' },
        { id: 22, nominal: 10000, price: 10500, label: '10K' },
        { id: 23, nominal: 25000, price: 25500, label: '25K' },
        { id: 24, nominal: 50000, price: 50500, label: '50K' },
    ],
};

export default function PPOBTopupForm() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [operator, setOperator] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [showCheckout, setShowCheckout] = useState(false);

    const handlePhoneChange = (value: string) => {
        setPhoneNumber(value);
        const detected = detectOperator(value);
        setOperator(detected);
        setSelectedProduct(null);
    };

    const handleProductSelect = (product: any) => {
        setSelectedProduct(product);
    };

    const handleCheckout = () => {
        setShowCheckout(true);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const adminFee = 1000;
    const totalPrice = selectedProduct ? selectedProduct.price + adminFee : 0;

    return (
        <div className="max-w-2xl mx-auto">
            {!showCheckout ? (
                <>
                    {/* Phone Input */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Nomor HP
                        </label>
                        <div className="relative">
                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                placeholder="08xx xxxx xxxx"
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                                maxLength={13}
                            />
                        </div>

                        {operator && (
                            <div className="mt-3 flex items-center gap-2">
                                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold capitalize">
                                    {operator}
                                </div>
                                <span className="text-sm text-gray-600">terdeteksi</span>
                            </div>
                        )}
                    </div>

                    {/* Product Grid */}
                    {operator && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                Pilih Nominal
                            </h3>
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {products[operator as keyof typeof products]?.map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => handleProductSelect(product)}
                                        className={`p-4 rounded-lg border-2 transition-all hover:border-blue-500 ${selectedProduct?.id === product.id
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200'
                                            }`}
                                    >
                                        <p className="font-bold text-gray-900 text-lg">{product.label}</p>
                                        <p className="text-sm text-gray-600">{formatPrice(product.price)}</p>
                                    </button>
                                ))}
                            </div>

                            {selectedProduct && (
                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                >
                                    Lanjut Bayar
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    )}
                </>
            ) : (
                /* Checkout Summary */
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Ringkasan Pembayaran
                    </h2>

                    {/* Details */}
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Nomor HP</span>
                            <span className="font-semibold text-gray-900">{phoneNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Operator</span>
                            <span className="font-semibold text-gray-900 capitalize">{operator}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Nominal</span>
                            <span className="font-semibold text-gray-900">
                                {formatPrice(selectedProduct.nominal)}
                            </span>
                        </div>
                        <div className="border-t pt-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Harga Produk</span>
                                <span className="text-gray-900">{formatPrice(selectedProduct.price)}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Biaya Admin</span>
                                <span className="text-gray-900">{formatPrice(adminFee)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                                <span className="text-gray-900">Total Bayar</span>
                                <span className="text-blue-600">{formatPrice(totalPrice)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Button */}
                    <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors mb-3">
                        <Zap className="w-5 h-5" />
                        Bayar Sekarang
                    </button>

                    <button
                        onClick={() => setShowCheckout(false)}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition-colors"
                    >
                        Kembali
                    </button>
                </div>
            )}
        </div>
    );
}
