#!/bin/bash

# Setup Auto-Complaint Bot
echo "🚀 Setting up Auto-Complaint Bot..."

# 1. Create Complaint Generator Utility
echo "🤖 Creating Complaint Logic..."
mkdir -p src/components/complaint
cat << 'EOF' > src/components/complaint/ComplaintButton.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Flag, Mail } from 'lucide-react'
import { toast } from 'sonner'

export function ComplaintButton({ 
    awb, 
    courier, 
    lastUpdateDate 
}: { 
    awb: string, 
    courier: string, 
    lastUpdateDate: string 
}) {
    
    // Check if stuck > 3 days (72 hours)
    const isStuck = () => {
        const last = new Date(lastUpdateDate).getTime()
        const now = new Date().getTime()
        const diffHours = (now - last) / (1000 * 60 * 60)
        return diffHours > 72
    }

    const generateEmail = () => {
        const subject = encodeURIComponent(`Komplain Paket Stuck - ${courier.toUpperCase()} - ${awb}`)
        const body = encodeURIComponent(
`Halo Tim CS ${courier.toUpperCase()},

Saya ingin melaporkan paket dengan nomor resi: ${awb}
Status terakhir tidak bergerak sejak: ${new Date(lastUpdateDate).toLocaleDateString()}.
Sudah lebih dari 3 hari paket ini tidak ada update (stuck).

Mohon bantuan untuk pengecekan segera.

Terima kasih.`
        )
        
        // Open Gmail or Default Mail App
        window.open(`mailto:customercare@${courier.toLowerCase()}.co.id?subject=${subject}&body=${body}`, '_blank')
        toast.success('Draft email created!')
    }

    if (!isStuck()) return null

    return (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                    <Flag className="w-5 h-5 text-red-600" />
                </div>
                <div>
                    <h4 className="font-semibold text-red-900">Paket Terindikasi Stuck</h4>
                    <p className="text-xs text-red-600">Tidak bergerak lebih dari 3 hari.</p>
                </div>
            </div>
            <Button 
                variant="destructive" 
                size="sm" 
                className="gap-2"
                onClick={generateEmail}
            >
                <Mail className="w-4 h-4" />
                Lapor CS
            </Button>
        </div>
    )
}
EOF

echo "✅ Complaint Bot Module Setup Complete!"
