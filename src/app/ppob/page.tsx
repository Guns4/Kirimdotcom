import PPOBTopupForm from '@/components/ppob/PPOBTopupForm';
import { Smartphone, Zap, Shield, Clock } from 'lucide-react';

export const metadata = {
    title: 'Beli Pulsa & Paket Data - PPOB | CekKirim',
    description: 'Beli pulsa dan paket data semua operator. Proses cepat, harga murah, langsung masuk!',
};

export default function PPOBPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Smartphone className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Beli Pulsa & Paket Data 📱
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Isi pulsa semua operator. Cepat, murah, dan langsung masuk!
                    </p>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-white rounded-xl p-4 text-center shadow-md">
                        <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                        <p className="font-semibold text-gray-900">Proses Instan</p>
                        <p className="text-sm text-gray-600">< 5 detik</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-md">
                        <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="font-semibold text-gray-900">100% Aman</p>
                        <p className="text-sm text-gray-600">Terpercaya</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-md">
                        <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="font-semibold text-gray-900">24/7</p>
                        <p className="text-sm text-gray-600">Kapan saja</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-md">
                        <Smartphone className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="font-semibold text-gray-900">Semua Operator</p>
                        <p className="text-sm text-gray-600">Lengkap</p>
                    </div>
                </div>

                {/* Main Form */}
                <PPOBTopupForm />

                {/* Supported Operators */}
                <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        Operator yang Didukung
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {['Telkomsel', 'Indosat', 'XL', 'Tri', 'Smartfren'].map((op) => (
                            <div key={op} className="bg-gray-50 rounded-lg p-4 text-center">
                                <p className="font-bold text-gray-900">{op}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
