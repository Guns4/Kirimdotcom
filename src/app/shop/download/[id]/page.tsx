'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSecureDownloadUrl } from '@/app/actions/digital-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Lock, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function SecureDownloadPage() {
    const params = useParams()
    const router = useRouter()
    const productId = params.id as string

    const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
    const [product, setProduct] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [expiresIn, setExpiresIn] = useState<number>(0)

    useEffect(() => {
        generateDownloadLink()
    }, [productId])

    const generateDownloadLink = async () => {
        setLoading(true)
        try {
            const result = await getSecureDownloadUrl(productId)
            if (result?.data) {
                setDownloadUrl(result.data.downloadUrl)
                setProduct(result.data.product)
                setExpiresIn(result.data.expiresIn)
                toast.success('Download link generated!')
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate download link')
            setTimeout(() => router.push('/shop'), 2000)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="container-custom py-12 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-600">Generating secure download link...</p>
            </div>
        )
    }

    return (
        <div className="container-custom py-8 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="w-6 h-6 text-green-600" />
                        Secure Download
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {product && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-bold text-lg">{product.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Purchase verified</span>
                        </div>
                        <div className="flex items-center gap-2 text-orange-600">
                            <Clock className="w-5 h-5" />
                            <span className="text-sm">Link expires in {Math.floor(expiresIn / 60)} minutes</span>
                        </div>
                    </div>

                    {downloadUrl && (
                        <a href={downloadUrl} download>
                            <Button className="w-full gap-2 text-lg py-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                                <Download className="w-6 h-6" />
                                Download Now
                            </Button>
                        </a>
                    )}

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                        <p className="font-medium mb-2">🔒 Secure Download Notes:</p>
                        <ul className="list-disc ml-5 space-y-1">
                            <li>This link is unique and expires in 1 hour</li>
                            <li>You can re-download anytime from &quot;My Purchases&quot;</li>
                            <li>Do not share this link with others</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
