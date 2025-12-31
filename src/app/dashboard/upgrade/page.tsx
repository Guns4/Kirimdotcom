import { createClient } from '@/utils/supabase/server';
import { getUserTier } from '@/lib/tier-pricing';
import TierUpgrade from '@/components/pricing/TierUpgrade';
import { redirect } from 'next/navigation';

export default async function UpgradePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    const currentTier = await getUserTier(user.id);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">UpgradeAccount Level</h1>
                    <p className="text-xl text-gray-600">Unlock wholesale shipping rates and maximize your profit.</p>
                </div>

                <TierUpgrade currentTier={currentTier} />
            </div>
        </div>
    );
}
