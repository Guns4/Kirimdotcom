import AdminBentoGrid from '@/components/admin/dashboard/AdminBentoGrid';

export default function AdminDashboardPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Command Center</h1>
                <p className="text-gray-500">Real-time overview of business performance.</p>
            </div>

            <AdminBentoGrid />

            {/* Other existing dashboard content would go here... */}
            <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-400">
                Other Charts / Tables Area
            </div>
        </div>
    );
}
