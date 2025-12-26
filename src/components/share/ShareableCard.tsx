'use client'

import { forwardRef, useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { CheckCircle2, Package, MapPin } from 'lucide-react'

interface ShareableCardProps {
    trackingData: {
        resiNumber: string
        courier: string
        currentStatus: string
        statusDate: string
        history: Array<{
            date: string
            desc: string
            location: string
        }>
    }
}

export const ShareableCard = forwardRef<HTMLDivElement, ShareableCardProps>(
    ({ trackingData }, ref) => {
        const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

        useEffect(() => {
            // Generate QR code
            const trackingUrl = `${window.location.origin}/track/${trackingData.courier}/${trackingData.resiNumber}`

            QRCode.toDataURL(trackingUrl, {
                width: 120,
                margin: 1,
                color: {
                    dark: '#6366f1',
                    light: '#ffffff',
                },
            }).then(setQrCodeUrl)
        }, [trackingData])

        const isDelivered = trackingData.currentStatus.toUpperCase().includes('TERKIRIM') ||
            trackingData.currentStatus.toUpperCase().includes('DELIVERED')

        return (
            <div
                ref={ref}
                className="w-[600px] bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-8 rounded-2xl text-white"
                style={{
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
            >
                {/* Header with Logo */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">CekKirim</h1>
                            <p className="text-xs text-white/70">Tracking Made Easy</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-white/70">Dilacak pada</p>
                        <p className="text-sm font-semibold">{new Date().toLocaleDateString('id-ID')}</p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="mb-6">
                    <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${isDelivered
                            ? 'bg-green-500'
                            : 'bg-yellow-500'
                        }`}>
                        {isDelivered && <CheckCircle2 className="w-6 h-6" />}
                        <span className="text-xl font-bold">
                            {isDelivered ? 'TERKIRIM' : 'DALAM PENGIRIMAN'}
                        </span>
                    </div>
                </div>

                {/* Tracking Info */}
                <div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-xs text-white/70 mb-1">Nomor Resi</p>
                            <p className="text-lg font-bold font-mono">{trackingData.resiNumber}</p>
                        </div>
                        <div>
                            <p className="text-xs text-white/70 mb-1">Kurir</p>
                            <p className="text-lg font-bold">{trackingData.courier.toUpperCase()}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-white/70 mb-1">Status Terakhir</p>
                        <p className="text-sm font-semibold">{trackingData.currentStatus}</p>
                        <p className="text-xs text-white/60">{trackingData.statusDate}</p>
                    </div>
                </div>

                {/* Timeline */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Riwayat Pengiriman
                    </h3>
                    <div className="space-y-2">
                        {trackingData.history.slice(0, 4).map((item, index) => (
                            <div key={index} className="flex items-start gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-white mt-1.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{item.desc}</p>
                                    <div className="flex items-center gap-2 text-xs text-white/70">
                                        <span>{item.date}</span>
                                        <span>•</span>
                                        <span className="truncate">{item.location}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer with QR Code */}
                <div className="flex items-center justify-between pt-6 border-t border-white/20">
                    <div className="flex-1">
                        <p className="text-xs text-white/70 mb-1">Scan untuk lacak paket:</p>
                        <p className="text-sm font-semibold">cekkirim.com</p>
                    </div>
                    {qrCodeUrl && (
                        <div className="bg-white p-2 rounded-lg">
                            <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24" />
                        </div>
                    )}
                </div>

                {/* Powered by */}
                <div className="mt-4 text-center">
                    <p className="text-xs text-white/50">
                        Powered by <span className="font-semibold">CekKirim.com</span>
                    </p>
                </div>
            </div>
        )
    }
)

ShareableCard.displayName = 'ShareableCard'
