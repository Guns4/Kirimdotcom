#!/bin/bash

# Setup WebUSB Thermal Printer Module
echo "🚀 Setting up WebUSB Thermal Printer Driver..."

# 1. Create Printer Service
echo "🖨️  Creating Printer Logic..."
mkdir -p src/lib/printer
cat << 'EOF' > src/lib/printer/thermal-printer.ts
'use client'

// ESC/POS Commands for Thermal Printers
export class ThermalPrinter {
    private device: USBDevice | null = null
    private interface: USBInterface | null = null
    private endpoint: USBEndpoint | null = null

    async connect() {
        try {
            // Request USB device with thermal printer vendor IDs
            // Common: 0x0416 (SGDY), 0x04b8 (Epson), 0x0483 (Zjiang)
            this.device = await navigator.usb.requestDevice({
                filters: [
                    { vendorId: 0x0416 }, // SGDY
                    { vendorId: 0x04b8 }, // Epson
                    { vendorId: 0x0483 }, // Zjiang
                ]
            })

            await this.device.open()
            await this.device.selectConfiguration(1)
            await this.device.claimInterface(0)

            // Find OUT endpoint
            const iface = this.device.configuration?.interfaces[0]
            this.interface = iface?.alternate
            this.endpoint = this.interface?.endpoints.find(e => e.direction === 'out')

            return true
        } catch (error) {
            console.error('Failed to connect printer:', error)
            throw new Error('No printer connected or permission denied')
        }
    }

    async disconnect() {
        if (this.device) {
            await this.device.close()
            this.device = null
        }
    }

    // ESC/POS command builders
    private encode(text: string) {
        return new TextEncoder().encode(text)
    }

    private buildCommand(...bytes: number[]) {
        return new Uint8Array(bytes)
    }

    async print(content: string) {
        if (!this.device || !this.endpoint) throw new Error('Printer not connected')

        const commands: Uint8Array[] = []

        // Initialize printer
        commands.push(this.buildCommand(0x1B, 0x40)) // ESC @

        // Set alignment center
        commands.push(this.buildCommand(0x1B, 0x61, 0x01))

        // Bold on
        commands.push(this.buildCommand(0x1B, 0x45, 0x01))
        commands.push(this.encode('RESI PENGIRIMAN\n\n'))
        commands.push(this.buildCommand(0x1B, 0x45, 0x00)) // Bold off

        // Set alignment left
        commands.push(this.buildCommand(0x1B, 0x61, 0x00))

        // Print content
        commands.push(this.encode(content))

        // Line feeds
        commands.push(this.encode('\n\n\n'))

        // Cut paper
        commands.push(this.buildCommand(0x1D, 0x56, 0x00))

        // Send all commands
        for (const cmd of commands) {
            await this.device.transferOut(this.endpoint.endpointNumber, cmd)
        }
    }

    async printReceipt(data: {
        trackingNumber: string
        sender: string
        receiver: string
        address: string
        weight: string
        service: string
    }) {
        const receipt = `
Tracking: ${data.trackingNumber}
--------------------------------
Dari: ${data.sender}
Kepada: ${data.receiver}
${data.address}

Layanan: ${data.service}
Berat: ${data.weight}
--------------------------------
Terima kasih!
        `.trim()

        await this.print(receipt)
    }
}
EOF

# 2. Create Server Action
echo "⚡ Creating Print Action..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/print.ts
'use server'

import { safeAction } from '@/lib/safe-action'
import { createClient } from '@/utils/supabase/server'

export const getReceiptData = async (orderId: string) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const { data: order } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('user_id', user.id)
            .single()

        if (!order) throw new Error('Order not found')

        return {
            trackingNumber: order.tracking_number,
            sender: user.email || 'Unknown',
            receiver: order.customer_name,
            address: order.shipping_address,
            weight: `${order.weight || 0} kg`,
            service: order.courier || 'Standard'
        }
    })
}
EOF

# 3. Create UI Component
echo "🎨 Creating Print Button..."
mkdir -p src/components/print
cat << 'EOF' > src/components/print/PrintButton.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, Loader2, Check } from 'lucide-react'
import { ThermalPrinter } from '@/lib/printer/thermal-printer'
import { getReceiptData } from '@/app/actions/print'
import { toast } from 'sonner'

export function PrintButton({ orderId }: { orderId: string }) {
    const [loading, setLoading] = useState(false)
    const [connected, setConnected] = useState(false)

    const handlePrint = async () => {
        setLoading(true)
        try {
            // 1. Get receipt data from server
            const result = await getReceiptData(orderId)
            if (!result?.success || !result.data) throw new Error('Failed to get receipt data')

            // 2. Connect to printer
            const printer = new ThermalPrinter()
            await printer.connect()
            setConnected(true)

            // 3. Print receipt
            await printer.printReceipt(result.data)

            // 4. Disconnect
            await printer.disconnect()

            toast.success('Resi berhasil dicetak!')
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Gagal mencetak resi')
        } finally {
            setLoading(false)
            setConnected(false)
        }
    }

    return (
        <Button 
            onClick={handlePrint} 
            disabled={loading}
            variant="outline"
            className="gap-2"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : connected ? (
                <Check className="w-4 h-4 text-green-600" />
            ) : (
                <Printer className="w-4 h-4" />
            )}
            {loading ? 'Mencetak...' : 'Cetak Resi (USB)'}
        </Button>
    )
}
EOF

echo "✅ WebUSB Thermal Printer Setup Complete!"
echo "👉 Note: Requires HTTPS or localhost to work. User must grant USB device permission."
