import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="glass-card mt-auto border-t border-gray-200">
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Links Section */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Navigasi</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/"
                                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    Beranda
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/tentang"
                                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    Tentang Kami
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/kontak"
                                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    Hubungi Kami
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/syarat-ketentuan"
                                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    Syarat & Ketentuan
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Copyright Section */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">CekKirim</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Solusi terpercaya untuk mengecek ongkos kirim dan melacak paket Anda di seluruh Indonesia.
                        </p>
                        <p className="text-xs text-gray-500">
                            &copy; {currentYear} CekKirim. All rights reserved.
                        </p>
                    </div>

                    {/* Social Media Section */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Ikuti Kami</h3>
                        <div className="flex space-x-4">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-300 hover:scale-110"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white transition-all duration-300 hover:scale-110"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white transition-all duration-300 hover:scale-110"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="mailto:info@cekkirim.com"
                                className="p-2 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white transition-all duration-300 hover:scale-110"
                                aria-label="Email"
                            >
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
