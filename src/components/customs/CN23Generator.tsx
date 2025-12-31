'use client'

import { useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Download } from 'lucide-react'
import { CN23Form } from '@/lib/customs/cn23-template'
import { getInternationalShipment } from '@/app/actions/customs'
import { toast } from 'sonner'

export function CN23Generator({ orderId }: { orderId: string }) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const loadData = async () => {
        setLoading(true)
        try {
            const result = await getInternationalShipment(orderId)
            if (result?.data) {
                setData(result.data)
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load shipment data')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    CN23 Customs Declaration
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!data ? (
                    <Button onClick={loadData} disabled={loading} className="w-full">
                        {loading ? 'Loading...' : 'Generate CN23 Form'}
                    </Button>
                ) : (
                    <div className="space-y-3">
                        <div className="p-3 bg-green-50 border border-green-200 rounded">
                            <p className="text-sm text-green-700 font-medium">CN23 Form Ready!</p>
                            <p className="text-xs text-gray-600 mt-1">
                                Destination: {data.receiver.country}
                            </p>
                        </div>

                        <PDFDownloadLink
                            document={<CN23Form data={data} />}
                            fileName={`CN23_${orderId}.pdf`}
                            className="w-full"
                        >
                            {({ loading: pdfLoading }) => (
                                <Button className="w-full gap-2" disabled={pdfLoading}>
                                    <Download className="w-4 h-4" />
                                    {pdfLoading ? 'Generating PDF...' : 'Download CN23 (PDF)'}
                                </Button>
                            )}
                        </PDFDownloadLink>

                        <p className="text-xs text-muted-foreground text-center">
                            Lampirkan form ini pada paket internasional Anda
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
