'use client';

import { useRef, useState, useEffect } from 'react';
import { Download, Upload, Type, Image as ImageIcon, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';

interface LabelMakerProps {
    isPremium?: boolean;
}

export default function LabelMakerCanvas({ isPremium = false }: LabelMakerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [storeName, setStoreName] = useState('Toko Saya');
    const [address, setAddress] = useState('Jl. Contoh No. 123, Jakarta');
    const [phone, setPhone] = useState('08123456789');
    const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
    const [fontSize, setFontSize] = useState(16);
    const [borderStyle, setBorderStyle] = useState('solid');

    // Draw label on canvas
    const drawLabel = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;

        if (borderStyle === 'dashed') {
            ctx.setLineDash([10, 5]);
        } else if (borderStyle === 'dotted') {
            ctx.setLineDash([3, 3]);
        } else if (borderStyle === 'double') {
            ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
            ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        } else {
            ctx.setLineDash([]);
        }

        if (borderStyle !== 'double') {
            ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        }
        ctx.setLineDash([]);

        // Logo
        if (logoImage) {
            const logoSize = 80;
            const logoX = 30;
            const logoY = 30;
            ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
        }

        // Store name
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${fontSize + 8}px Arial`;
        ctx.fillText(storeName, logoImage ? 130 : 30, 50);

        // Address
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText(address, logoImage ? 130 : 30, 80);

        // Phone
        ctx.fillText(`📱 ${phone}`, logoImage ? 130 : 30, 110);

        // Recipient section
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(20, 140, canvas.width - 40, 150);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('KEPADA:', 30, 165);

        ctx.font = '14px Arial';
        ctx.fillText('Nama Penerima: _______________________', 30, 190);
        ctx.fillText('Alamat: _______________________', 30, 215);
        ctx.fillText('         _______________________', 30, 235);
        ctx.fillText('HP: _______________________', 30, 260);

        // Watermark (if not premium)
        if (!isPremium) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.font = 'bold 12px Arial';
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height - 20);
            ctx.rotate(-0.1);
            ctx.textAlign = 'center';
            ctx.fillText('Dibuat di CekKirim.com', 0, 0);
            ctx.restore();
        }
    };

    // Handle logo upload
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                setLogoImage(img);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    // Export to PDF
    const exportToPDF = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        // Add canvas as image to PDF
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 100;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

        // Add text instructions
        pdf.setFontSize(10);
        pdf.text('Label siap cetak. Gunting sesuai garis border.', 10, imgHeight + 20);

        pdf.save(`label-${storeName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    };

    // Redraw when inputs change
    useEffect(() => {
        drawLabel();
    }, [storeName, address, phone, logoImage, fontSize, borderStyle, isPremium]);

    return (
        <div className="space-y-6">
            {/* Canvas */}
            <div className="flex justify-center">
                <div className="border-4 border-gray-300 rounded-lg overflow-hidden shadow-xl">
                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={320}
                        className="bg-white"
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Left column - Text inputs */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Nama Toko
                        </label>
                        <input
                            type="text"
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Nama Toko Anda"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Alamat Toko
                        </label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Alamat lengkap"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            No. WhatsApp
                        </label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="08123456789"
                        />
                    </div>
                </div>

                {/* Right column - Style controls */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <ImageIcon className="inline w-4 h-4 mr-1" />
                            Upload Logo Toko
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Rekomendasi: 200x200px, PNG/JPG</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Type className="inline w-4 h-4 mr-1" />
                            Ukuran Font
                        </label>
                        <input
                            type="range"
                            min="12"
                            max="24"
                            value={fontSize}
                            onChange={(e) => setFontSize(parseInt(e.target.value))}
                            className="w-full"
                        />
                        <p className="text-sm text-gray-600">{fontSize}px</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Gaya Border
                        </label>
                        <select
                            value={borderStyle}
                            onChange={(e) => setBorderStyle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                            <option value="double">Double</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
                <button
                    onClick={exportToPDF}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <Download className="w-5 h-5" />
                    Download Label (PDF)
                </button>

                <button
                    onClick={drawLabel}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-5 h-5" />
                    Reset
                </button>
            </div>

            {/* Premium upsell */}
            {!isPremium && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="text-4xl">👑</div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 mb-2">
                                Upgrade ke Premium untuk Hasil Lebih Profesional!
                            </h3>
                            <ul className="text-sm text-gray-700 space-y-1 mb-4">
                                <li>✓ Tanpa watermark "Dibuat di CekKirim"</li>
                                <li>✓ Lebih banyak pilihan template</li>
                                <li>✓ Export resolusi tinggi</li>
                                <li>✓ Custom border & font</li>
                            </ul>
                            <a
                                href="/pricing"
                                className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded-lg transition-colors"
                            >
                                Upgrade Sekarang - Rp 50K/bulan
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
