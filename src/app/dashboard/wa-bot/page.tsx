import { WADashboard } from '@/components/wa/WADashboard';

export default function WABotPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Bot Server Manager</h1>
                <p className="text-gray-600">Manage your automated WhatsApp instances</p>
            </div>
            <WADashboard />
        </div>
    );
}
