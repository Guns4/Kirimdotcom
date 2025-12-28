'use client';

import { Copy, ExternalLink, Trash2 } from 'lucide-react';

interface RotatorCardProps {
    rotator: {
        id: string;
        link_name: string;
        slug: string;
        total_clicks: number;
        total_conversions: number;
        cs_count: number;
        conversion_rate: number;
        cs_numbers: string;
    };
}

export function RotatorCard({ rotator }: RotatorCardProps) {
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(`${window.location.origin}/wa/${rotator.slug}`);
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {rotator.link_name}
                    </h3>
                    <div className="flex items-center gap-2 text-blue-600 font-mono text-sm">
                        <span>cekkirim.com/wa/{rotator.slug}</span>
                        <button
                            onClick={handleCopy}
                            className="p-1 hover:bg-blue-50 rounded"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                        <a
                            href={`/wa/${rotator.slug}`}
                            target="_blank"
                            className="p-1 hover:bg-blue-50 rounded"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-semibold">Total Klik</p>
                    <p className="text-2xl font-bold text-blue-900">
                        {formatNumber(rotator.total_clicks)}
                    </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 font-semibold">Konversi WA</p>
                    <p className="text-2xl font-bold text-green-900">
                        {formatNumber(rotator.total_conversions)}
                    </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-purple-600 font-semibold">Jumlah CS</p>
                    <p className="text-2xl font-bold text-purple-900">
                        {rotator.cs_count}
                    </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3">
                    <p className="text-xs text-yellow-600 font-semibold">Conv. Rate</p>
                    <p className="text-2xl font-bold text-yellow-900">
                        {rotator.conversion_rate}%
                    </p>
                </div>
            </div>

            {/* CS List */}
            <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Customer Service:</p>
                <div className="flex flex-wrap gap-2">
                    {JSON.parse(rotator.cs_numbers || '[]').map((cs: any, idx: number) => (
                        <span
                            key={idx}
                            className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                        >
                            📱 {cs.name}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
