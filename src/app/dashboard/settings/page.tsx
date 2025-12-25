import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { UserSettings } from '@/components/dashboard/UserSettings'

export default async function SettingsPage() {
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

    return (
        <DashboardLayout
            user={{ email: user.email || '', id: user.id }}
            profile={profile}
        >
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Pengaturan</h1>
                    <p className="text-gray-400">Kelola pengaturan akun Anda</p>
                </div>

                <UserSettings
                    user={{ email: user.email || '', id: user.id }}
                    profile={profile}
                />
            </div>
        </DashboardLayout>
    )
}
