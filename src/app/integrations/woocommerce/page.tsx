'use client';

import React from 'react';
import { Download, CheckCircle, Settings, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function WooCommerceIntegrationPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero */}
            <header className="bg-indigo-900 text-white py-20 px-4 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-center mb-6">
                        <ShoppingCart size={64} className="text-yellow-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Otomatisasi Ongkir Toko Online Anda
                    </h1>
                    <p className="text-xl text-indigo-200 mb-8 max-w-2xl mx-auto">
                        Integrasikan CekKirim dengan WooCommerce. Tampilkan ongkir JNE, J&T, SiCepat real-time kepada pelanggan Anda tanpa ribet.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/downloads/cekkirim-shipping.zip" // Need to handle file serving in Next.js public folder ideally
                            className="bg-yellow-500 text-indigo-900 px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition flex items-center justify-center gap-2"
                        >
                            <Download size={20} /> Download Plugin (v1.0)
                        </a>
                        <Link
                            href="/dashboard/api-keys"
                            className="bg-transparent border border-indigo-400 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-800 transition"
                        >
                            Dapatkan API Key
                        </Link>
                    </div>
                    <p className="mt-4 text-sm text-indigo-300">Requires WooCommerce 5.0+</p>
                </div>
            </header>

            {/* Features */}
            <section className="py-16 px-4">
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                    {[
                        { title: 'Multi Kurir', desc: 'JNE, J&T, SiCepat, Shopee Exp, dan lainnya dalam satu plugin.' },
                        { title: 'Real-Time', desc: 'Harga selalu update detik itu juga. Jaminan akurasi 99%.' },
                        { title: 'Markup Profit', desc: 'Otomatis tambahkan margin keuntungan di setiap pengiriman.' }
                    ].map((f, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
                            <CheckCircle className="text-green-500 mb-4" size={32} />
                            <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                            <p className="text-gray-600">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Installation Steps */}
            <section className="bg-white py-16 px-4 border-t">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Cara Install Plugin</h2>

                    <div className="space-y-8">
                        {[
                            { step: 1, title: 'Download & Upload', text: 'Download file zip di atas. Masuk ke WP Admin > Plugins > Add New > Upload Plugin.' },
                            { step: 2, title: 'Aktifkan Plugin', text: 'Klik "Activate". Masuk ke WooCommerce > Settings > Shipping > CekKirim Shipping.' },
                            { step: 3, title: 'Masukkan API Key', text: 'Copy API Key dari Dashboard CekKirim Anda dan paste di halaman setting plugin.' },
                            { step: 4, title: 'Selesai!', text: 'Ongkir otomatis muncul saat customer checkout.' }
                        ].map((s) => (
                            <div key={s.step} className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                                    {s.step}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">{s.title}</h4>
                                    <p className="text-gray-600">{s.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
