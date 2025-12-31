import React from 'react';

// ==========================================
// TypeScript Interfaces
// ==========================================

interface TrackingSummary {
    status: string;
    courier: string;
    waybill: string;
    receiver: string | null;
    date: string | null;
}

interface TrackingEvent {
    date: string;
    time?: string;
    location: string;
    description: string;
    desc?: string;  // Alternative field name from Binderbyte
}

interface TrackingData {
    summary: TrackingSummary;
    history: TrackingEvent[];
}

interface TrackingResultProps {
    data: TrackingData;
    showAds?: boolean;  // Toggle ads on/off
}

// ==========================================
// TrackingResult Component
// ==========================================

export default function TrackingResult({ data, showAds = true }: TrackingResultProps) {
    // Determine status color
    const getStatusColor = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('delivered') || statusLower.includes('terkirim')) {
            return 'bg-green-600';
        }
        if (statusLower.includes('process') || statusLower.includes('transit')) {
            return 'bg-blue-600';
        }
        if (statusLower.includes('pending') || statusLower.includes('manifest')) {
            return 'bg-yellow-600';
        }
        return 'bg-gray-600';
    };

    const statusColor = getStatusColor(data.summary.status);

    return (
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-6">

            {/* ==========================================
          HEADER - Package Status
          ========================================== */}
            <div className={`${statusColor} p-4 text-white`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold">Status: {data.summary.status}</h3>
                        <p className="text-sm opacity-90">
                            Resi: {data.summary.waybill} • {data.summary.courier.toUpperCase()}
                        </p>
                        {data.summary.receiver && (
                            <p className="text-xs opacity-80 mt-1">
                                Penerima: {data.summary.receiver}
                            </p>
                        )}
                    </div>
                    <div className="text-right">
                        {data.summary.date && (
                            <p className="text-xs opacity-80">{data.summary.date}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ==========================================
          💰 MONEY SPOT 1: Top Banner Ad
          Purpose: Cross-sell insurance/protection
          Conversion: ~2-5%
          ========================================== */}
            {showAds && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 border-b border-yellow-200">
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">🛡️</div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">
                                Paket Anda Belum Diasuransikan!
                            </p>
                            <p className="text-xs text-gray-600">
                                Lindungi dari kerusakan/kehilangan.
                                <a
                                    href="/insurance"
                                    className="ml-1 text-orange-600 font-bold hover:underline"
                                >
                                    Mulai dari Rp 500 →
                                </a>
                            </p>
                        </div>
                        <button className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded hover:bg-orange-600 transition">
                            BELI
                        </button>
                    </div>
                </div>
            )}

            {/* ==========================================
          TRACKING Timeline
          ========================================== */}
            <div className="p-6">
                <h4 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-xl">📍</span> Riwayat Perjalanan
                </h4>

                <div className="space-y-6 relative border-l-2 border-gray-300 ml-3">
                    {data.history.map((event, index) => {
                        const isFirst = index === 0;
                        const isLast = index === data.history.length - 1;
                        const description = event.description || event.desc || 'Status update';

                        return (
                            <div key={index} className="mb-6 ml-6 relative">
                                {/* Timeline Dot */}
                                <span
                                    className={`absolute -left-[31px] h-4 w-4 rounded-full border-2 border-white ${isFirst ? 'bg-green-500' : isLast ? 'bg-gray-400' : 'bg-blue-500'
                                        }`}
                                ></span>

                                {/* Event Details */}
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">
                                        {event.date}
                                        {event.time && ` • ${event.time}`}
                                    </p>
                                    <h5 className="font-bold text-gray-800 text-sm">
                                        {event.location}
                                    </h5>
                                    <p className="text-gray-600 text-sm mt-1">
                                        {description}
                                    </p>
                                </div>

                                {/* ==========================================
                    💰 MONEY SPOT 2: Native Ad in Timeline
                    Purpose: Product cross-sell
                    Placement: After 2nd event (optimal engagement)
                    ========================================== */}
                                {showAds && index === 1 && (
                                    <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl">📦</div>
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-green-800 mb-1">
                                                    🔥 Tips Seller & UMKM
                                                </p>
                                                <p className="text-xs text-gray-700">
                                                    Kehabisan lakban, bubble wrap, atau kardus?
                                                </p>
                                                <a
                                                    href="/shop"
                                                    className="inline-block mt-2 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 transition"
                                                >
                                                    Belanja Packing (Diskon 10%) →
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ==========================================
                    💰 MONEY SPOT 3: Google AdSense Slot
                    Purpose: Additional revenue
                    Placement: After last event
                    ========================================== */}
                                {showAds && isLast && (
                                    <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-200 text-center">
                                        <p className="text-xs text-gray-500 mb-2">Advertisement</p>
                                        {/* Replace with actual AdSense code */}
                                        <div className="bg-white p-4 border border-dashed border-gray-300 rounded">
                                            <p className="text-sm text-gray-400">
                                                Google AdSense 728x90
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Slot ID: ca-pub-xxxxx
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ==========================================
          FOOTER - Additional Actions
          ========================================== */}
            <div className="bg-gray-50 p-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                    <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition">
                        📋 Salin Resi
                    </button>
                    <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded hover:bg-gray-300 transition">
                        📲 Bagikan ke WhatsApp
                    </button>
                </div>

                {showAds && (
                    <div className="mt-3 text-center">
                        <p className="text-xs text-gray-500">
                            Butuh bantuan?
                            <a href="/faq" className="ml-1 text-blue-600 hover:underline">
                                FAQ & Tutorial
                            </a>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ==========================================
// Export Types for External Use
// ==========================================

export type { TrackingData, TrackingSummary, TrackingEvent, TrackingResultProps };
