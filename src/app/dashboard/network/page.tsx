import { createClient } from '@/utils/supabase/server';
import { getNetworkStats } from '@/lib/downline-service';
import DownlineDashboard from '@/components/network/DownlineDashboard';
import { redirect } from 'next/navigation';

export default async function NetworkPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    const stats = await getNetworkStats(user.id);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Affiliate Network</h1>
                <DownlineDashboard stats={stats} />
            </div>
        </div>
    );
}
