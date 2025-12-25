'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { Package, Search } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative py-20 md:py-32 overflow-hidden">
            {/* Background Gradient Effects */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
            </div>

            <div className="container-custom">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Main Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
                    >
                        Cek Ongkir & Lacak Resi{' '}
                        <span className="gradient-text">Pengiriman</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
                    >
                        Solusi terpercaya untuk mengecek ongkos kirim dan melacak paket Anda
                        dari berbagai ekspedisi di seluruh Indonesia
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Button variant="gradient" size="lg" className="w-full sm:w-auto">
                            <Search className="w-5 h-5 mr-2" />
                            Cek Ongkir Sekarang
                        </Button>
                        <Button variant="outline" size="lg" className="w-full sm:w-auto">
                            <Package className="w-5 h-5 mr-2" />
                            Lacak Paket
                        </Button>
                    </motion.div>

                    {/* Trust Badge */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="mt-12 flex flex-wrap gap-6 justify-center items-center text-sm text-gray-500"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span>Real-time Data</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            <span>10+ Ekspedisi</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                            <span>100% Gratis</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
