import StickerGenerator from '@/components/tools/StickerGenerator';

export default function StickerToolPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Free Shipping Label Generator</h1>
                <p className="text-lg text-gray-600">
                    Create professional shipping labels in seconds. No design skills needed.
                </p>
            </div>

            <StickerGenerator />

            <div className="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-6">
                    <div className="text-4xl mb-4">⚡</div>
                    <h3 className="text-xl font-bold mb-2">Instant PDF</h3>
                    <p className="text-gray-600">Download ready-to-print A4 PDF files instantly.</p>
                </div>
                <div className="p-6">
                    <div className="text-4xl mb-4">🏷️</div>
                    <h3 className="text-xl font-bold mb-2">Standard Size</h3>
                    <p className="text-gray-600">Optimized for standard 10-label A4 sticker paper.</p>
                </div>
                <div className="p-6">
                    <div className="text-4xl mb-4">🎯</div>
                    <h3 className="text-xl font-bold mb-2">Professional</h3>
                    <p className="text-gray-600">Clean, legible designs that couriers love.</p>
                </div>
            </div>
        </div>
    );
}
