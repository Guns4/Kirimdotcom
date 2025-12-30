'use client';

import { useState, useEffect } from 'react';
import {
    MessageCircle, Package, ExternalLink, Eye,
    MousePointerClick, Search, ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
    getBioByUsername,
    getBioLinks,
    trackPageView,
    trackLinkClick,
    trackResiCheck,
    COURIER_OPTIONS,
    type BioPage,
    type BioLink
} from '@/lib/bio-link';

interface BioPageViewProps {
    username: string;
}

export default function BioPageView({ username }: BioPageViewProps) {
    const [bioPage, setBioPage] = useState<BioPage | null>(null);
    const [links, setLinks] = useState<BioLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [resiNumber, setResiNumber] = useState('');
    const [trackingResult, setTrackingResult] = useState<string | null>(null);

    useEffect(() => {
        async function loadBioPage() {
            const page = await getBioByUsername(username);
            if (page) {
                setBioPage(page);
                const pageLinks = await getBioLinks(page.id);
                setLinks(pageLinks);
                trackPageView(page.id);
            }
            setLoading(false);
        }
        loadBioPage();
    }, [username]);

    const handleLinkClick = async (link: BioLink) => {
        if (bioPage) {
            await trackLinkClick(bioPage.id, link.id);
        }
        window.open(link.url, '_blank');
    };

    const handleCheckResi = async () => {
        if (!resiNumber.trim()) {
            toast.error('Masukkan nomor resi');
            return;
        }

        if (bioPage) {
            await trackResiCheck(bioPage.id);
        }

        // Mock tracking result
        setTrackingResult('Paket dalam perjalanan ke kota tujuan');
        toast.success('Resi ditemukan!');
    };

    const handleWhatsApp = () => {
        if (bioPage?.whatsappNumber) {
            window.open(`https://wa.me/${bioPage.whatsappNumber}`, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-pulse text-white">Loading...</div>
            </div>
        );
    }

    if (!bioPage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Halaman tidak ditemukan</h1>
                    <p className="text-gray-400">Username @{username} tidak terdaftar</p>
                </div>
            </div>
        );
    }

    const allowedCouriers = COURIER_OPTIONS.filter(c =>
        bioPage.allowedCouriers.includes(c.id)
    );

    return (
        <div
            className="min-h-screen py-8 px-4"
            style={{ backgroundColor: bioPage.backgroundColor }}
        >
            <div className="max-w-md mx-auto">
                {/* Profile */}
                <div className="text-center mb-8">
                    {bioPage.avatarUrl ? (
                        <img
                            src={bioPage.avatarUrl}
                            alt={bioPage.displayName}
                            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white"
                        />
                    ) : (
                        <div
                            className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
                            style={{ backgroundColor: bioPage.accentColor }}
                        >
                            {bioPage.displayName.charAt(0)}
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-white">{bioPage.displayName}</h1>
                    {bioPage.bio && <p className="text-gray-300 mt-2">{bioPage.bio}</p>}
                </div>

                {/* Resi Tracker */}
                {bioPage.showResiTracker && (
                    <Card className="mb-6 bg-white/10 border-0 backdrop-blur">
                        <CardContent className="py-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Package className="w-5 h-5 text-white" />
                                <span className="text-white font-medium">Cek Resi</span>
                            </div>
                            <div className="flex gap-2 mb-3">
                                <Input
                                    value={resiNumber}
                                    onChange={(e) => setResiNumber(e.target.value)}
                                    placeholder="Masukkan nomor resi..."
                                    className="bg-white/20 border-0 text-white placeholder:text-gray-400"
                                />
                                <Button
                                    onClick={handleCheckResi}
                                    style={{ backgroundColor: bioPage.accentColor }}
                                >
                                    <Search className="w-4 h-4" />
                                </Button>
                            </div>
                            {allowedCouriers.length > 0 && (
                                <div className="flex gap-2 flex-wrap">
                                    {allowedCouriers.map(courier => (
                                        <span key={courier.id} className="text-xs text-gray-400">
                                            {courier.icon} {courier.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {trackingResult && (
                                <div className="mt-3 p-3 bg-green-500/20 rounded-lg text-green-300 text-sm">
                                    {trackingResult}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* WhatsApp Button */}
                {bioPage.whatsappNumber && (
                    <Button
                        className="w-full mb-4 h-14 text-lg"
                        style={{ backgroundColor: '#25D366' }}
                        onClick={handleWhatsApp}
                    >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Chat WhatsApp
                    </Button>
                )}

                {/* Links */}
                <div className="space-y-3">
                    {links.filter(l => l.isActive).map(link => (
                        <button
                            key={link.id}
                            onClick={() => handleLinkClick(link)}
                            className="w-full p-4 rounded-xl text-white font-medium flex items-center justify-between hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: bioPage.accentColor }}
                        >
                            <span>{link.title}</span>
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    ))}
                </div>

                {/* Products Section (if enabled) */}
                {bioPage.showProducts && (
                    <div className="mt-8">
                        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                            🛍️ Produk Kami
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {[1, 2, 3, 4].map(i => (
                                <Card key={i} className="bg-white/10 border-0 overflow-hidden">
                                    <div className="h-24 bg-gray-600" />
                                    <CardContent className="py-2 px-3">
                                        <div className="text-white text-sm font-medium truncate">
                                            Produk Sample {i}
                                        </div>
                                        <div className="text-xs" style={{ color: bioPage.accentColor }}>
                                            Rp 50.000
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    <a href="https://cekkkirim.com" className="hover:text-gray-300">
                        cekkkirim.com/bio
                    </a>
                </div>
            </div>
        </div>
    );
}
