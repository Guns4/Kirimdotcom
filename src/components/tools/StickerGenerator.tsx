'use client';

import { useState } from 'react';
import {
    Printer, Download, CreditCard, LayoutTemplate,
    MessageSquare, Phone, Store, Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
    generateStickerPDF,
    STICKER_TEMPLATES,
    type StickerData
} from '@/lib/sticker-generator';

export default function StickerGenerator() {
    const [templateId, setTemplateId] = useState('basic');
    const [shopName, setShopName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [message, setMessage] = useState('Wajib Video Unboxing!');
    const [generating, setGenerating] = useState(false);

    // Mock purchase state for demo
    const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false);

    const handleGenerate = async () => {
        if (!shopName) {
            toast.error('Nama toko wajib diisi');
            return;
        }

        const template = STICKER_TEMPLATES.find(t => t.id === templateId);
        if (template?.isPremium && !isPremiumUnlocked) {
            toast.error('Template Premium terkunci', {
                description: 'Silakan beli template ini seharga Rp 5.000'
            });
            return;
        }

        setGenerating(true);
        try {
            const data: StickerData = {
                shopName,
                whatsapp,
                message,
                templateId
            };
            await generateStickerPDF(data);
            toast.success('Stiker berhasil didownload!');
        } catch (error) {
            toast.error('Gagal membuat PDF');
            console.error(error);
        } finally {
            setGenerating(false);
        }
    };

    const handleUnlockPremium = async () => {
        // Simulate payment
        const confirm = window.confirm('Beli Template Premium seharga Rp 5.000? Saldo akan terpotong.');
        if (confirm) {
            // In real app: Call API
            setIsPremiumUnlocked(true);
            setTemplateId('premium');
            toast.success('Template Premium terbuka!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                        <Printer className="w-8 h-8 text-blue-600" />
                        Generator Stiker Pengiriman
                    </h1>
                    <p className="text-gray-600 mt-2">Buat stiker pengiriman custom untuk tokomu dalam hitungan detik</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Settings Form */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Informasi Toko</CardTitle>
                                <CardDescription>Data ini akan muncul di stiker</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                                        <Store className="w-4 h-4" /> Nama Toko
                                    </label>
                                    <Input
                                        value={shopName}
                                        onChange={(e) => setShopName(e.target.value)}
                                        placeholder="Contoh: Toko Berkah Jaya"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                                        <Phone className="w-4 h-4" /> WhatsApp
                                    </label>
                                    <Input
                                        value={whatsapp}
                                        onChange={(e) => setWhatsapp(e.target.value)}
                                        placeholder="0812xxxx (Opsional)"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" /> Pesan Khusus
                                    </label>
                                    <Input
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Wajib Video Unboxing"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Pilih Template</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    {STICKER_TEMPLATES.map(template => {
                                        const isLocked = template.isPremium && !isPremiumUnlocked;
                                        return (
                                            <div
                                                key={template.id}
                                                className={`
                                                    border-2 rounded-lg p-4 cursor-pointer transition-all relative
                                                    ${templateId === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}
                                                `}
                                                onClick={() => !isLocked && setTemplateId(template.id)}
                                            >
                                                <div className="font-bold flex items-center justify-between mb-2">
                                                    {template.name}
                                                    {template.isPremium && <CreditCard className="w-4 h-4 text-orange-500" />}
                                                </div>
                                                <div className="h-20 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                                                    Preview {template.name}
                                                </div>

                                                {isLocked && (
                                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-lg">
                                                        <Lock className="w-6 h-6 text-gray-500 mb-1" />
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="h-7 text-xs"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUnlockPremium();
                                                            }}
                                                        >
                                                            Buka Rp 5.000
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Button
                            className="w-full text-lg h-12"
                            onClick={handleGenerate}
                            disabled={generating}
                        >
                            {generating ? (
                                'Memproses PDF...'
                            ) : (
                                <>
                                    <Download className="w-5 h-5 mr-2" />
                                    Download PDF (A4)
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Live Preview */}
                    <div className="hidden lg:block relative">
                        <div className="sticky top-8">
                            <Card className="h-[600px] flex flex-col">
                                <CardHeader>
                                    <CardTitle>Live Preview (Visual)</CardTitle>
                                    <CardDescription>Gambaran kasar layout stiker pada kertas A4</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-hidden bg-gray-100 p-8 flex items-center justify-center">
                                    {/* A4 Paper Simulation */}
                                    <div className="bg-white shadow-xl w-[300px] h-[424px] grid grid-cols-2 grid-rows-5 gap-2 p-4 text-[4px] leading-tight">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`
                                                    border rounded overflow-hidden p-2 flex flex-col
                                                    ${templateId === 'premium' ? 'border-pink-300 bg-pink-50' : 'border-gray-300'}
                                                `}
                                            >
                                                <div className="font-bold text-center mb-1 truncate">
                                                    {shopName || 'NAMA TOKO'}
                                                </div>
                                                <div className="border-b border-gray-200 my-1" />
                                                <div className="flex-1">
                                                    <div>Kepada: ...</div>
                                                    <div>Alamat: ...</div>
                                                </div>
                                                <div className={`text-center font-bold mt-1 ${templateId === 'premium' ? 'bg-red-500 text-white' : ''}`}>
                                                    {message}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
