import WADashboard from '@/components/wa/WADashboard';

export const metadata = {
    title: 'WhatsApp Bot Manager | CekKirim',
    description: 'Hubungkan dan kelola bot WhatsApp Anda untuk otomatisasi bisnis.',
};

export default function WABotPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2">WhatsApp Bot SaaS</h1>
                    <p className="text-green-100">
                        Hubungkan nomor WhatsApp Anda dan otomatisasi notifikasi pengiriman
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <WADashboard />
            </div>
        </div>
    );
}
