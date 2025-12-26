import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import AdminTabs from '@/components/admin/AdminTabs'

export default async function AdminPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Check if user is admin
    if (profile?.role !== 'admin') {
        redirect('/dashboard')
    }

    // Fetch current site settings
    const { data: settings } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single()

    return (
        <DashboardLayout
            user={{ email: user.email || '', id: user.id }}
            profile={profile}
        >
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">🔮 Admin Panel</h1>
                    <p className="text-gray-400">Mata Dewa - Pantau dan kelola website</p>
                </div>

                <AdminTabs settings={settings} />
            </div>
        </DashboardLayout>
    )
}
