'use client';

import { Package, Smartphone, Zap, CreditCard, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import ReceiptPrinter from './ReceiptPrinter';

export default function PosLayout() {
    const [commission, setCommission] = useState(0);

    const handleTransaction = (amount: number, fee: number) => {
        // Simulate transaction
        setCommission(prev => prev + fee);
        // Trigger toast or sound here
        // const audio = new Audio('/sounds/cash-register.mp3'); // Mock path, browser might block if not interacted
        console.log(`Transaction: Rp ${amount}, Commission: Rp ${fee}`);
    };

    const menus = [
        { id: 1, label: 'Terima Paket', icon: Package, color: 'bg-blue-600', fee: 5000 },
        { id: 2, label: 'Jual Pulsa', icon: Smartphone, color: 'bg-purple-600', fee: 1500 },
        { id: 3, label: 'Token Listrik', icon: Zap, color: 'bg-yellow-500', fee: 2000 },
        { id: 4, label: 'Topup E-Wallet', icon: CreditCard, color: 'bg-green-600', fee: 2500 },
    ];

    return (
        <div className="max-w-4xl mx-auto p-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Agent Dashboard</h1>
                    <p className="text-gray-500 text-sm">Warung Berkah Jaya • ID: AGT-8821</p>
                </div>

                <div className="flex flex-col items-end">
                    <div className="text-right mb-2">
                        <span className="text-xs text-gray-500">Total Komisi Hari Ini</span>
                        <p className="text-3xl font-bold text-green-600">Rp {commission.toLocaleString()}</p>
                    </div>
                    <ReceiptPrinter />
                </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {menus.map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleTransaction(50000, item.fee)}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all flex flex-col items-center justify-center gap-4 group active:scale-95"
                    >
                        <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                            <item.icon className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-gray-800 group-hover:text-blue-600">{item.label}</h3>
                            <p className="text-xs text-green-600 font-medium">+Komisi Rp {item.fee}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Recent Transactions (Mock) */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Transaksi Terakhir</h3>
                    <button className="text-blue-600 text-sm font-medium flex items-center">Lihat Semua <ChevronRight className="w-4 h-4" /></button>
                </div>
                <div className="divide-y divide-gray-100">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-800">Kirim Paket Regular</p>
                                    <p className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900">Rp 12.000</p>
                                <p className="text-xs text-green-600 font-medium">+Rp 1.500</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
