import TrackingResult from '@/components/tracking/TrackingResult';

// Generate mock dates outside component to avoid impure Date.now() during render
const now = new Date();
const oneDayAgo = new Date(now.getTime() - 86400000);
const twoDaysAgo = new Date(now.getTime() - 172800000);
const threeDaysAgo = new Date(now.getTime() - 259200000);

export default function TrackingPage() {
    // Mock tracking data
    const mockTracking = {
        waybill: 'JNE12345678900',
        courier: 'JNE',
        status: 'ON_PROCESS' as const,
        history: [
            {
                date: now.toISOString(),
                desc: 'Paket sudah diterima kurir',
                location: 'Jakarta Pusat',
            },
            {
                date: oneDayAgo.toISOString(),
                desc: 'Paket dalam proses packing',
                location: 'Warehouse Jakarta',
            },
            {
                date: twoDaysAgo.toISOString(),
                desc: 'Pesanan telah dibuat',
                location: 'Sistem',
            },
            {
                date: threeDaysAgo.toISOString(),
                desc: 'Menunggu konfirmasi pembayaran',
                location: 'Sistem',
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Lacak Paket</h1>
                    <p className="text-gray-600">Pantau status pengiriman paket Anda secara real-time</p>
                </div>

                <TrackingResult data={mockTracking} />
            </div>
        </div>
    );
}
