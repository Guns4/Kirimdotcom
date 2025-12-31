'use client'

import { useState } from 'react'
import { logDeliveryProof, verifyDeliveryProof } from '@/app/actions/blockchain'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, CheckCircle, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export function BlockchainProof({ trackingNumber, status }: { trackingNumber: string, status: string }) {
    const [proof, setProof] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const handleLogToBlockchain = async () => {
        setLoading(true)
        try {
            const result = await logDeliveryProof(trackingNumber, status)
            if (result?.data) {
                setProof(result.data)
                toast.success('Delivery proof logged to blockchain!')
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to log to blockchain')
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async () => {
        setLoading(true)
        try {
            const result = await verifyDeliveryProof(trackingNumber)
            if (result?.data) {
                setProof(result.data)
                if (result.data.verified) {
                    toast.success('Delivery verified on blockchain!')
                } else {
                    toast.warning('No blockchain record found')
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'Verification failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                    <Shield className="w-5 h-5" />
                    Blockchain Proof of Delivery
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!proof ? (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                            Log delivery status to blockchain for immutable proof
                        </p>
                        <div className="flex gap-2">
                            <Button onClick={handleLogToBlockchain} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                                {loading ? 'Processing...' : 'Log to Blockchain'}
                            </Button>
                            <Button onClick={handleVerify} disabled={loading} variant="outline">
                                Verify Existing Proof
                            </Button>
                        </div>
                    </div>
                ) : proof.verified ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-bold text-green-700">Verified on Blockchain</span>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <Badge>{proof.status}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Timestamp:</span>
                                <span>{new Date(proof.timestamp * 1000).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Hash:</span>
                                <span className="font-mono text-xs">{proof.deliveryHash?.slice(0, 20)}...</span>
                            </div>
                        </div>

                        {proof.txHash && (
                            <a 
                                href={`https://mumbai.polygonscan.com/tx/${proof.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                            >
                                View on PolygonScan
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                        No blockchain record found for this tracking number
                    </div>
                )}

                <p className="text-xs text-gray-500">
                    Anti-fraud protection: Delivery records are immutably stored on Polygon blockchain
                </p>
            </CardContent>
        </Card>
    )
}
