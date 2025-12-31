'use client';

import { BioProfile } from '@/lib/bio-link';
import { Search, MessageCircle, ExternalLink, ShoppingBag, Truck } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function BioPageView({ profile }: { profile: BioProfile }) {
    const [resi, setResi] = useState('');

    const handleTrackResi = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Tracking Resi: ${resi} via CekKirim.com (Filtered for ${profile.display_name})`);
        // Ideally call trackBioEvent here via Server Action
    };

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center">
            <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative overflow-hidden">
                {/* Header Background */}
                <div
                    className="h-48 w-full absolute top-0 left-0 bg-gray-200"
                    style={{ backgroundColor: profile.theme_color }}
                ></div>

                <div className="relative pt-24 px-6 pb-12 flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="w-28 h-28 rounded-full border-4 border-white bg-white shadow-md overflow-hidden mb-4 relative z-10">
                        {profile.avatar_url ? (
                            <Image
                                src={profile.avatar_url}
                                alt={profile.display_name}
                                width={112}
                                height={112}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-400">
                                {profile.display_name.charAt(0)}
                            </div>
                        )}
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile.display_name}</h1>
                    <p className="text-gray-600 mb-6 px-4">{profile.bio_text}</p>

                    {/* WhatsApp Button */}
                    {profile.whatsapp_number && (
                        <a
                            href={`https://wa.me/${profile.whatsapp_number}`}
                            target="_blank"
                            className="flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 mb-8 w-full justify-center"
                        >
                            <MessageCircle size={20} /> Chat WhatsApp
                        </a>
                    )}

                    {/* Resi Tracker Module */}
                    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8 text-left">
                        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Truck size={18} className="text-blue-600" /> Cek Resi
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">Lacak paket dari toko kami.</p>
                        <form onSubmit={handleTrackResi} className="flex gap-2">
                            <input
                                type="text"
                                value={resi}
                                onChange={(e) => setResi(e.target.value)}
                                placeholder="Masukkan No. Resi..."
                                className="flex-1 px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg">
                                <Search size={18} />
                            </button>
                        </form>
                        {profile.courier_filters && profile.courier_filters.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                {profile.courier_filters.map(c => (
                                    <span key={c} className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 uppercase">{c}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Links */}
                    <div className="w-full space-y-3 mb-8">
                        {profile.links.map(link => (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                className="block w-full bg-white border border-gray-200 hover:border-gray-400 px-5 py-4 rounded-xl font-medium text-gray-800 shadow-sm transition-all hover:-translate-y-0.5 flex justify-between items-center group"
                            >
                                <span className="truncate">{link.title}</span>
                                <ExternalLink size={16} className="text-gray-400 group-hover:text-gray-600" />
                            </a>
                        ))}
                    </div>

                    {/* Products Grid */}
                    {profile.products.length > 0 && (
                        <div className="w-full text-left">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <ShoppingBag size={18} /> Featured Products
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {profile.products.map(product => (
                                    <a
                                        key={product.id}
                                        href={product.external_url}
                                        target="_blank"
                                        className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                                    >
                                        <div className="h-32 bg-gray-100 relative">
                                            {/* Placeholder for Product Image */}
                                            {product.image_url ? (
                                                <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <ShoppingBag size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h4 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                                                {product.name}
                                            </h4>
                                            <p className="font-bold text-gray-900">Rp {product.price.toLocaleString()}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-12 text-sm text-gray-400">
                        Powered by <strong className="text-gray-600">CekKirim.com</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}
