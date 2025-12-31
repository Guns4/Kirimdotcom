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
