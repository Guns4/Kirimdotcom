import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const metadata: Metadata = {
    title: 'CekKirim - Lacak Paket & Cek Ongkir Terlengkap',
    description: 'Platform logistik terlengkap Indonesia. Lacak paket semua kurir, cek ongkir murah, booking resi, dan kurir lokal.',
};

// Tracking Form Component
function TrackingForm() {
    return (
        <Card variant="elevated" padding="lg" className="h-full">
            <div className="space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-display-sm md:text-display-md text-surface-900">
                        Lacak <span className="text-gradient-primary">Paket</span> Anda
                    </h1>
                    <p className="text-body-md text-surface-600">
                        Cek status pengiriman dari semua kurir dalam satu tempat
                    </p>
                </div>

                {/* Form */}
                <form className="space-y-4">
                    <div className="relative">
                        <Input
                            inputSize="xl"
                            placeholder="Masukkan nomor resi..."
                            leftIcon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            }
                        />
                    </div>
                    <Button variant="gradient" size="xl" className="w-full">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Lacak Sekarang
                    </Button>
                </form>

                {/* Courier Logos */}
                <div className="pt-4 border-t border-surface-100">
                    <p className="text-body-xs text-surface-500 mb-3">Mendukung semua kurir:</p>
                    <div className="flex flex-wrap items-center gap-4 text-surface-400 text-sm font-medium">
                        <span className="px-3 py-1.5 bg-surface-100 rounded-lg">JNE</span>
                        <span className="px-3 py-1.5 bg-surface-100 rounded-lg">J&T</span>
                        <span className="px-3 py-1.5 bg-surface-100 rounded-lg">SiCepat</span>
                        <span className="px-3 py-1.5 bg-surface-100 rounded-lg">AnterAja</span>
                        <span className="px-3 py-1.5 bg-surface-100 rounded-lg">+10</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}

// Promo Banner Component
function PromoBanner() {
    return (
        <Card variant="primary" padding="md" className="h-full overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-500 rounded-full blur-3xl" />
            </div>

            <div className="relative space-y-3">
                <span className="badge badge-secondary">🔥 Promo</span>
                <h3 className="text-lg font-bold text-primary-800">
                    Gratis Ongkir Hingga Rp 20.000!
                </h3>
                <p className="text-sm text-primary-700">
                    Booking resi sekarang dan nikmati potongan ongkir.
                </p>
                <Button variant="secondary" size="sm">
                    Klaim Sekarang →
                </Button>
            </div>
        </Card>
    );
}

// User Stats Component
function UserStats() {
    return (
        <Card variant="glass" padding="md" className="h-full">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-surface-600">Statistik Anda</span>
                    <Link href="/dashboard" className="text-xs text-primary-500 hover:underline">
                        Lihat Semua
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-primary-500">0</div>
                        <div className="text-xs text-surface-500">Paket Aktif</div>
                    </div>
                    <div className="p-3 bg-white/50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-secondary-500">0</div>
                        <div className="text-xs text-surface-500">Poin</div>
                    </div>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                    Login untuk Tracking
                </Button>
            </div>
        </Card>
    );
}

// Quick Actions Component
function QuickActions() {
    const actions = [
        { icon: '📦', label: 'Cek Ongkir', href: '/cek-ongkir', color: 'bg-primary-50' },
        { icon: '🏍️', label: 'Kurir Lokal', href: '/kurir-lokal', color: 'bg-secondary-50' },
        { icon: '🎫', label: 'Booking Resi', href: '/dashboard/booking', color: 'bg-success-50' },
        { icon: '🏪', label: 'Supplier', href: '/suppliers', color: 'bg-warning-50' },
    ];

    return (
        <Card variant="default" padding="md">
            <div className="grid grid-cols-4 gap-3">
                {actions.map((action) => (
                    <Link
                        key={action.label}
                        href={action.href}
                        className={`${action.color} flex flex-col items-center justify-center p-4 rounded-xl hover:scale-105 transition-transform`}
                    >
                        <span className="text-2xl mb-1">{action.icon}</span>
                        <span className="text-xs font-medium text-surface-700">{action.label}</span>
                    </Link>
                ))}
            </div>
        </Card>
    );
}

// Features Section
function Features() {
    const features = [
        {
            icon: '🚀',
            title: 'Cepat & Akurat',
            desc: 'Data realtime dari semua kurir',
        },
        {
            icon: '💰',
            title: 'Ongkir Termurah',
            desc: 'Bandingkan harga semua ekspedisi',
        },
        {
            icon: '🔒',
            title: 'Aman & Terpercaya',
            desc: 'Rekber untuk transaksi COD',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature) => (
                <Card key={feature.title} variant="outlined" padding="sm">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{feature.icon}</span>
                        <div>
                            <h4 className="font-semibold text-surface-800">{feature.title}</h4>
                            <p className="text-xs text-surface-500">{feature.desc}</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}

// Main Homepage
export default function HomePage() {
    return (
        <main className="min-h-screen bg-surface-50">
            {/* Hero Section with Bento Grid */}
            <section className="section hero-pattern">
                <div className="container-main">
                    {/* Bento Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                        {/* Main Tracking Form - Large Box (Left) */}
                        <div className="lg:col-span-2 lg:row-span-2 order-1">
                            <TrackingForm />
                        </div>

                        {/* Promo Banner - Medium Box (Top Right) */}
                        <div className="order-2 lg:order-2">
                            <PromoBanner />
                        </div>

                        {/* User Stats - Small Box (Bottom Right) */}
                        <div className="order-3 lg:order-3">
                            <UserStats />
                        </div>
                    </div>

                    {/* Quick Actions - Below Grid */}
                    <div className="mt-6">
                        <QuickActions />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="section-tight bg-white">
                <div className="container-main">
                    <div className="text-center mb-8">
                        <h2 className="text-display-xs text-surface-900">
                            Kenapa <span className="text-gradient">CekKirim</span>?
                        </h2>
                    </div>
                    <Features />
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-tight">
                <div className="container-main">
                    <Card variant="gradient" className="bg-gradient-primary text-white text-center p-8 md:p-12">
                        <h2 className="text-display-xs md:text-display-sm text-white mb-4">
                            Siap Kelola Pengiriman Lebih Mudah?
                        </h2>
                        <p className="text-white/80 mb-6 max-w-xl mx-auto">
                            Daftar gratis dan nikmati semua fitur CekKirim untuk bisnis Anda.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button variant="secondary" size="lg">
                                Daftar Gratis
                            </Button>
                            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-500">
                                Pelajari Lebih Lanjut
                            </Button>
                        </div>
                    </Card>
                </div>
            </section>
        </main>
    );
}
