import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export default async function HistoryPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fetch user search history
    const { data: history } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

    return (
        <DashboardLayout
            user={{ email: user.email || '', id: user.id }}
            profile={profile}
        >
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Riwayat Pencarian
                    </h1>
                    <p className="text-gray-400">
                        {history?.length || 0} pencarian ditemukan
                    </p>
                </div>

                {history && history.length > 0 ? (
                    <div className="space-y-4">
                        {history.map((item) => (
                            <div key={item.id} className="glass-card p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${item.type === 'resi'
                                                    ? 'bg-blue-500/20 text-blue-300'
                                                    : 'bg-green-500/20 text-green-300'
                                                    }`}
                                            >
                                                {item.type === 'resi' ? 'Cek Resi' : 'Cek Ongkir'}
                                            </span>
                                        </div>
                                        <p className="text-white font-medium mb-1">{item.query}</p>
                                        <p className="text-sm text-gray-400">
                                            {new Date(item.created_at).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-12 text-center">
                        <p className="text-gray-400">Belum ada riwayat pencarian</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
