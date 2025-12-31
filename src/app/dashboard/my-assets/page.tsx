import { createClient } from '@/utils/supabase/server';
import { getUserAssets } from '@/lib/digital-store';
import MyLibrary from '@/components/digital/MyLibrary';
import { redirect } from 'next/navigation';

export default async function MyAssetsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    const assets = await getUserAssets(user.id);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Digital Assets</h1>
                        <p className="text-gray-600">Manage and download your purchased templates and ebooks.</p>
                    </div>
                </div>

                <MyLibrary assets={assets} />
            </div>
        </div>
    );
}
