'use client'

import { useState, useEffect } from 'react'
import { getRecentUsers, banUser, updateUserRole } from '@/app/actions/analytics'
import {
    Users,
    Shield,
    Ban,
    Crown,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    User
} from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

interface UserProfile {
    id: string
    email: string
    role: string
    subscription_status: string
    created_at: string
    avatar_url: string | null
}

export function UserManagement() {
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const data = await getRecentUsers(20)
            setUsers(data)
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleBanUser = async (userId: string) => {
        if (!confirm('Yakin ingin memblokir user ini?')) return

        setActionLoading(userId)
        const result = await banUser(userId)
        setActionLoading(null)

        if (result.success) {
            setToast({ message: 'User berhasil diblokir', type: 'success' })
            fetchUsers()
        } else {
            setToast({ message: result.error || 'Gagal memblokir user', type: 'error' })
        }

        setTimeout(() => setToast(null), 3000)
    }

    const handleUpgradeToPremium = async (userId: string) => {
        setActionLoading(userId)
        const result = await updateUserRole(userId, 'premium')
        setActionLoading(null)

        if (result.success) {
            setToast({ message: 'User berhasil di-upgrade ke Premium', type: 'success' })
            fetchUsers()
        } else {
            setToast({ message: result.error || 'Gagal upgrade user', type: 'error' })
        }

        setTimeout(() => setToast(null), 3000)
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Admin
                    </span>
                )
            case 'premium':
                return (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Premium
                    </span>
                )
            default:
                return (
                    <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full flex items-center gap-1">
                        <User className="w-3 h-3" />
                        User
                    </span>
                )
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Aktif</span>
            case 'expired':
                return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">Expired</span>
            default:
                return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">{status}</span>
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">👥 User Management</h2>
                    <p className="text-gray-400 text-sm">Kelola pengguna terdaftar</p>
                </div>
                <button
                    onClick={fetchUsers}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    } text-white`}>
                    {toast.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5" />
                    ) : (
                        <AlertTriangle className="w-5 h-5" />
                    )}
                    {toast.message}
                </div>
            )}

            {/* Users Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-4 px-6 text-gray-400 text-sm font-medium">Email</th>
                                <th className="text-left py-4 px-6 text-gray-400 text-sm font-medium">Role</th>
                                <th className="text-left py-4 px-6 text-gray-400 text-sm font-medium">Status</th>
                                <th className="text-left py-4 px-6 text-gray-400 text-sm font-medium">Bergabung</th>
                                <th className="text-right py-4 px-6 text-gray-400 text-sm font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-400">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12">
                                        <div className="flex justify-center">
                                            <EmptyState
                                                title="Tidak ada pengguna"
                                                description="Belum ada pengguna yang terdaftar di sistem."
                                                icon="search"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                    {user.email?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <span className="text-white text-sm">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">{getRoleBadge(user.role)}</td>
                                        <td className="py-4 px-6">{getStatusBadge(user.subscription_status)}</td>
                                        <td className="py-4 px-6 text-gray-400 text-sm">
                                            {new Date(user.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {user.role !== 'admin' && user.role !== 'premium' && (
                                                    <button
                                                        onClick={() => handleUpgradeToPremium(user.id)}
                                                        disabled={actionLoading === user.id}
                                                        className="px-3 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 text-xs rounded-lg transition-all disabled:opacity-50"
                                                    >
                                                        {actionLoading === user.id ? '...' : '⬆️ Premium'}
                                                    </button>
                                                )}
                                                {user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleBanUser(user.id)}
                                                        disabled={actionLoading === user.id}
                                                        className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded-lg transition-all disabled:opacity-50 flex items-center gap-1"
                                                    >
                                                        <Ban className="w-3 h-3" />
                                                        {actionLoading === user.id ? '...' : 'Ban'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
