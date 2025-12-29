'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import Input from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, Package } from 'lucide-react';

type TabMode = 'ongkir' | 'resi';

export default function ServiceTabs() {
    const [activeTab, setActiveTab] = useState<TabMode>('ongkir');

    return (
        <section className="py-12 md:py-20">
            <div className="container-custom">
                <div className="max-w-3xl mx-auto">
                    {/* Tab Buttons */}
                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={() => setActiveTab('ongkir')}
                            className={`flex-1 relative py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'ongkir'
                                ? 'text-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            {activeTab === 'ongkir' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-gradient-primary rounded-xl shadow-lg"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <Calculator className="w-5 h-5" />
                                Cek Ongkir
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('resi')}
                            className={`flex-1 relative py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'resi'
                                ? 'text-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            {activeTab === 'resi' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-gradient-primary rounded-xl shadow-lg"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <Package className="w-5 h-5" />
                                Cek Resi
                            </span>
                        </button>
                    </div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'ongkir' ? (
                            <motion.div
                                key="ongkir"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="p-8 glass-card">
                                    <CardContent className="space-y-6 p-0">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Kota Asal
                                            </label>
                                            <Input placeholder="Pilih kota asal pengiriman" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Kota Tujuan
                                            </label>
                                            <Input placeholder="Pilih kota tujuan pengiriman" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Berat (gram)
                                            </label>
                                            <Input type="number" placeholder="Masukkan berat paket" />
                                        </div>
                                        <Button variant="gradient" size="lg" className="w-full">
                                            <Calculator className="w-5 h-5 mr-2" />
                                            Hitung Ongkir
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="resi"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="p-8 glass-card">
                                    <CardContent className="space-y-6 p-0">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Pilih Ekspedisi
                                            </label>
                                            <Input placeholder="Pilih ekspedisi pengiriman" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nomor Resi
                                            </label>
                                            <Input placeholder="Masukkan nomor resi pengiriman" />
                                        </div>
                                        <Button variant="gradient" size="lg" className="w-full">
                                            <Package className="w-5 h-5 mr-2" />
                                            Lacak Paket
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
