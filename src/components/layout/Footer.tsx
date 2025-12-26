import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, ArrowRight, TrendingUp } from 'lucide-react';
import { popularRoutes } from '@/data/popular-routes';
import { LiteModeToggle } from '../ui/LiteModeToggle';

// Top 8 routes for footer
const topRoutes = popularRoutes.slice(0, 8);

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-900 border-t border-white/10">
            {/* Popular Routes Section */}
            <div className="container-custom py-8 border-b border-white/10">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-white">Rute Ongkir Populer</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {topRoutes.map((route, index) => (
                        <Link
                            key={index}
                            href={`/cek-ongkir/${route.originSlug}-ke-${route.destinationSlug}`}
                            className="flex items-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all group text-sm"
                        >
                            <span className="text-gray-400 group-hover:text-white truncate">
                                {route.origin}
                            </span>
                            <ArrowRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
                            <span className="text-gray-400 group-hover:text-white truncate">
                                {route.destination}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Main Footer */}
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <h3 className="font-bold text-white text-xl mb-3">CekKirim</h3>
                        <p className="text-sm text-gray-400 mb-4 max-w-md">
                            Solusi terpercaya untuk mengecek ongkos kirim dan melacak paket Anda di seluruh Indonesia.
                            Bandingkan harga dari 10+ ekspedisi secara gratis.
                        </p>
                        <div className="flex space-x-3">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="mailto:info@cekkirim.com"
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                                aria-label="Email"
                            >
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                        <div className="mt-6 inline-block">
                            <LiteModeToggle />
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Navigasi</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    Beranda
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/statistics" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    Statistik Kurir
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    Masuk
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    Kebijakan Privasi
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    Syarat & Ketentuan
                                </Link>
                            </li>
                            <li>
                                <Link href="/disclaimer" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    Disclaimer
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 pt-8 border-t border-white/10 text-center">
                    <p className="text-xs text-gray-500">
                        &copy; {currentYear} CekKirim. All rights reserved. Made with ❤️ in Indonesia
                    </p>
                </div>
            </div>
        </footer>
    );
}

