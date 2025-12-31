'use client';

import { useState } from 'react';
import { UserAsset, generateDownloadLink } from '@/lib/digital-store';
import { Download, FileText, BookOpen, Disc, GraduationCap, Package, Loader2, AlertCircle } from 'lucide-react';

export default function MyLibrary({ assets }: { assets: UserAsset[] }) {
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const handleDownload = async (asset: UserAsset) => {
        if (asset.download_count >= asset.max_downloads) {
            alert('Download limit reached.');
            return;
        }

        setDownloadingId(asset.id);

        // Call server action or API route in real app. For now calling lib function conceptually via generic action wrapper needed, 
        // but let's assume this component is used where we can trigger the download logic or an API.
        // Since `generateDownloadLink` uses `createClient` (server), we actually need a Server Action wrapper.
        // For simplicity in this step, I'll alert. Ideally, `generateDownloadLink` should be a Server Action.

        alert("This would trigger a Server Action to get the signed URL. \nLogic is in src/lib/digital-store.ts");
        setDownloadingId(null);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'TEMPLATE': return <FileText className="text-blue-500" />;
            case 'EBOOK': return <BookOpen className="text-green-500" />;
            case 'SOFTWARE': return <Disc className="text-purple-500" />;
            case 'COURSE': return <GraduationCap className="text-orange-500" />;
            default: return <Package className="text-gray-500" />;
        }
    };

    if (assets.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No assets yet</h3>
                <p className="text-gray-500">Purchased digital products will appear here.</p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Browse Store</button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
                <div key={asset.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            {getIcon(asset.product.product_type)}
                        </div>
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                            {asset.product.product_type}
                        </span>
                    </div>

                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1" title={asset.product.title}>
                        {asset.product.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 title={asset.product.description}">
                        {asset.product.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-50">
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                            <span>Downloads: {asset.download_count}/{asset.max_downloads}</span>
                            <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                        </div>

                        <button
                            onClick={() => handleDownload(asset)}
                            disabled={downloadingId === asset.id || asset.download_count >= asset.max_downloads}
                            className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${asset.download_count >= asset.max_downloads
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            {downloadingId === asset.id ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : asset.download_count >= asset.max_downloads ? (
                                <>Limit Reached <AlertCircle size={16} /></>
                            ) : (
                                <>Download <Download size={16} /></>
                            )}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
