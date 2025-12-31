'use client';

import { useState } from 'react';
import { generateStickerPDF, StickerData } from '@/lib/sticker-generator';
import { Loader2, Printer, Lock } from 'lucide-react';

export default function StickerGenerator() {
    const [senderName, setSenderName] = useState('');
    const [senderPhone, setSenderPhone] = useState('');
    const [template, setTemplate] = useState<'BASIC' | 'PREMIUM'>('BASIC');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!senderName || !senderPhone) {
            alert('Please fill in Sender Name and Phone');
            return;
        }

        if (template === 'PREMIUM') {
            // Mock Payment Gateway
            if (!confirm('Premium Template costs Rp 5.000. Proceed with payment?')) {
                return;
            }
            // In real app, trigger Midtrans/Wallet deduction here
        }

        setIsGenerating(true);
        setTimeout(() => {
            generateStickerPDF({
                senderName,
                senderPhone,
                template
            });
            setIsGenerating(false);
        }, 1000); // Simulate processing
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Printer className="text-blue-600" />
                Shipping Sticker Generator
            </h2>

            <div className="space-y-6">
                {/* Input Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Toko / Pengirim</label>
                        <input
                            type="text"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Toko Berkah"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp</label>
                        <input
                            type="text"
                            value={senderPhone}
                            onChange={(e) => setSenderPhone(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. 08123456789"
                        />
                    </div>
                </div>

                {/* Template Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Select Template</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Basic */}
                        <div
                            onClick={() => setTemplate('BASIC')}
                            className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${template === 'BASIC' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold">Basic</span>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">FREE</span>
                            </div>
                            <div className="h-20 border border-gray-300 bg-white p-2 text-xs flex flex-col justify-center">
                                <div className="font-bold">PENGIRIM: {senderName || 'Nama Toko'}</div>
                                <div>{senderPhone || '081...'}</div>
                                <div className="mt-2 text-gray-400 border-t pt-1">Kepada: ...</div>
                            </div>
                        </div>

                        {/* Premium */}
                        <div
                            onClick={() => setTemplate('PREMIUM')}
                            className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${template === 'PREMIUM' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-red-600">Premium</span>
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded flex items-center gap-1">
                                    <Lock size={10} /> Rp 5k
                                </span>
                            </div>
                            <div className="h-20 border border-red-200 bg-white text-xs relative overflow-hidden">
                                <div className="bg-red-600 text-white text-[8px] text-center py-0.5 font-bold">FRAGILE</div>
                                <div className="p-2">
                                    <div className="font-bold text-red-800">{senderName || 'Nama Toko'}</div>
                                    <div className="opacity-75">{senderPhone || '081...'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-colors ${template === 'PREMIUM'
                            ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="animate-spin" /> Generating PDF...
                        </>
                    ) : (
                        <>
                            <Printer /> Download Sticker Sheet (A4)
                        </>
                    )}
                </button>

                <p className="text-xs text-center text-gray-500 my-2">
                    Generates an A4 PDF with 10 stickers, ready to print on standard label paper.
                </p>
            </div>
        </div>
    );
}
