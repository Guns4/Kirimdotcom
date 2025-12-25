'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion } from 'framer-motion'
import { Upload, Loader2, Check, X } from 'lucide-react'
import { useSiteSettings } from '@/store/useSiteSettings'
import Image from 'next/image'

interface LogoUploaderProps {
    currentLogoUrl: string | null
}

export function LogoUploader({ currentLogoUrl }: LogoUploaderProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const supabase = createClient()
    const { updateSettings } = useSiteSettings()

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('File harus berupa gambar')
            return
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setError('Ukuran file maksimal 2MB')
            return
        }

        setIsUploading(true)
        setError('')
        setSuccess(false)

        try {
            // Generate unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `logo-${Date.now()}.${fileExt}`
            const filePath = `logos/${fileName}`

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('assets')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                })

            if (uploadError) throw uploadError

            // Get public URL
            const {
                data: { publicUrl },
            } = supabase.storage.from('assets').getPublicUrl(filePath)

            // Update site_settings table
            const { error: updateError } = await supabase
                .from('site_settings')
                .update({ logo_url: publicUrl })
                .limit(1)

            if (updateError) throw updateError

            // Update global state
            updateSettings({ logo_url: publicUrl })

            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)

            // Delete old logo if exists
            if (currentLogoUrl && currentLogoUrl.includes('supabase')) {
                const oldPath = currentLogoUrl.split('/').pop()
                if (oldPath) {
                    await supabase.storage.from('assets').remove([`logos/${oldPath}`])
                }
            }
        } catch (err: any) {
            console.error('Upload error:', err)
            setError(err.message || 'Gagal upload logo')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* Current Logo Preview */}
            {currentLogoUrl && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Logo Saat Ini:</p>
                    <div className="relative w-32 h-32 bg-white/10 rounded-lg overflow-hidden">
                        <Image
                            src={currentLogoUrl}
                            alt="Current Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            )}

            {/* Upload Button */}
            <div className="relative">
                <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                />
                <label
                    htmlFor="logo-upload"
                    className={`block w-full p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer ${isUploading
                            ? 'border-gray-600 bg-gray-800/50 cursor-not-allowed'
                            : 'border-indigo-500/50 hover:border-indigo-500 hover:bg-indigo-500/10'
                        }`}
                >
                    <div className="flex flex-col items-center gap-3">
                        {isUploading ? (
                            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                        ) : success ? (
                            <Check className="w-10 h-10 text-green-400" />
                        ) : (
                            <Upload className="w-10 h-10 text-indigo-400" />
                        )}
                        <div className="text-center">
                            <p className="text-white font-medium">
                                {isUploading
                                    ? 'Mengupload...'
                                    : success
                                        ? 'Upload Berhasil!'
                                        : 'Click untuk upload logo baru'}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                PNG, JPG, or SVG (max 2MB)
                            </p>
                        </div>
                    </div>
                </label>
            </div>

            {/* Error Message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400"
                >
                    <X className="w-5 h-5" />
                    <p className="text-sm">{error}</p>
                </motion.div>
            )}

            {/* Success Message */}
            {success && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-3 text-green-400"
                >
                    <Check className="w-5 h-5" />
                    <p className="text-sm">
                        Logo berhasil diupdate! Refresh halaman untuk melihat perubahan.
                    </p>
                </motion.div>
            )}
        </div>
    )
}
