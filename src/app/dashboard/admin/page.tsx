import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { LogoUploader } from '@/components/admin/LogoUploader'
import { Settings2, Image, Users } from 'lucide-react'

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
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
                    <p className="text-gray-400">Kelola pengaturan website</p>
                </div>

                {/* Site Settings */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <Image className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Logo Website</h2>
                            <p className="text-sm text-gray-400">
                                Upload logo baru untuk mengubah tampilan website
                            </p>
                        </div>
                    </div>

                    <LogoUploader currentLogoUrl={settings?.logo_url || null} />
                </div>

                {/* Maintenance Mode */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                            <Settings2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Mode Pemeliharaan</h2>
                            <p className="text-sm text-gray-400">
                                Status: {settings?.maintenance_mode ? '🔴 Aktif' : '🟢 Tidak Aktif'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
