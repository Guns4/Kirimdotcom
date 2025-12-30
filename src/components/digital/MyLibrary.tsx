'use client';

import { useState, useEffect } from 'react';
import {
    Download, Clock, FileText, Package,
    Book, Film, Folder, RefreshCw, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    getUserLibrary,
    createSignedDownloadUrl,
    formatFileSize,
    formatPrice,
    CATEGORIES,
    type DigitalProduct,
    type DigitalPurchase
} from '@/lib/digital-store';

export default function MyLibrary() {
    const [library, setLibrary] = useState<{ purchase: DigitalPurchase; product: DigitalProduct }[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<string | null>(null);

    useEffect(() => {
        loadLibrary();
    }, []);

    async function loadLibrary() {
        setLoading(true);
        const data = await getUserLibrary('current-user');
        setLibrary(data);
        setLoading(false);
    }

    const handleDownload = async (purchase: DigitalPurchase, product: DigitalProduct) => {
        if (purchase.downloadCount >= purchase.maxDownloads) {
            toast.error('Batas download tercapai', {
                description: `Maksimal ${purchase.maxDownloads} kali download`
            });
            return;
        }

        setDownloading(product.id);

        try {
            const { url, expiresAt } = await createSignedDownloadUrl(purchase.id, product.filePath);

            // Open download in new tab
            window.open(url, '_blank');

            toast.success('Download dimulai!', {
                description: `Link valid sampai ${expiresAt.toLocaleString('id-ID')}`
            });

            // Update download count locally
            setLibrary(prev => prev.map(item =>
                item.purchase.id === purchase.id
                    ? { ...item, purchase: { ...item.purchase, downloadCount: item.purchase.downloadCount + 1 } }
                    : item
            ));
        } catch (error) {
            toast.error('Gagal generate link download');
        } finally {
            setDownloading(null);
        }
    };

    const getCategoryIcon = (category: DigitalProduct['category']) => {
        switch (category) {
            case 'TEMPLATE': return <FileText className="w-5 h-5 text-blue-500" />;
            case 'EBOOK': return <Book className="w-5 h-5 text-green-500" />;
            case 'SOFTWARE': return <Package className="w-5 h-5 text-purple-500" />;
            case 'COURSE': return <Film className="w-5 h-5 text-orange-500" />;
            default: return <Folder className="w-5 h-5 text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Folder className="w-6 h-6 text-blue-500" />
                        Aset Saya
                    </h1>
                    <p className="text-gray-600">Produk digital yang sudah Anda beli</p>
                </div>

                {/* Library Grid */}
                {library.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">
                                Belum ada produk digital
                            </h3>
                            <p className="text-gray-400 mb-4">
                                Produk digital yang Anda beli akan muncul di sini
                            </p>
                            <Button variant="outline" asChild>
                                <a href="/digital-store">Jelajahi Produk</a>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {library.map(({ purchase, product }) => (
                            <Card key={purchase.id}>
                                <CardContent className="py-4">
                                    <div className="flex items-start gap-4">
                                        {/* Thumbnail */}
                                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                            {product.thumbnailUrl ? (
                                                <img
                                                    src={product.thumbnailUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                getCategoryIcon(product.category)
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {getCategoryIcon(product.category)}
                                                <span className="text-xs text-gray-500 uppercase">
                                                    {CATEGORIES[product.category].name}
                                                </span>
                                            </div>
                                            <h3 className="font-medium text-lg truncate">{product.name}</h3>
                                            <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>

                                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                                                <span>{product.fileType} • {formatFileSize(product.fileSize || 0)}</span>
                                                <span>Download: {purchase.downloadCount}/{purchase.maxDownloads}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="text-right">
                                                <div className="font-bold text-blue-600">
                                                    {formatPrice(purchase.amountPaid)}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {new Date(purchase.createdAt).toLocaleDateString('id-ID')}
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => handleDownload(purchase, product)}
                                                disabled={downloading === product.id || purchase.downloadCount >= purchase.maxDownloads}
                                                className="w-full"
                                            >
                                                {downloading === product.id ? (
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                ) : purchase.downloadCount >= purchase.maxDownloads ? (
                                                    'Limit Tercapai'
                                                ) : (
                                                    <>
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Download Info */}
                <Card className="mt-8 bg-blue-50 border-blue-200">
                    <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Tentang Download</p>
                                <ul className="list-disc list-inside text-blue-700 space-y-1">
                                    <li>Link download valid selama 24 jam</li>
                                    <li>Maksimal 5 kali download per produk</li>
                                    <li>Link download dikirim ke email juga</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
