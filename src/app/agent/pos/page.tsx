import PosLayout from '@/components/agent/PosLayout';

export const metadata = {
    title: 'Agent POS - Kasir Warung',
    description: 'Point of Sale system for CekKirim Agents.',
};

export default function AgentPosPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-4">
            <PosLayout />
        </div>
    );
}
