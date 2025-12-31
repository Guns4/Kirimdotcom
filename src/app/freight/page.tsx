'use client'

import { useState, useEffect } from 'react'
import { getFreightForwarders, requestQuote } from '@/app/actions/freight'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Ship, Star, Package, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function FreightMarketplacePage() {
    const [forwarders, setForwarders] = useState<any[]>([])
    const [selectedForwarder, setSelectedForwarder] = useState<any>(null)
    const [quoteForm, setQuoteForm] = useState({
        originPort: '',
        destinationPort: '',
        cargoType: 'LCL',
        commodity: '',
        weight: '',
        volume: '',
        notes: ''
    })

    useEffect(() => {
        loadForwarders()
    }, [])

    const loadForwarders = async () => {
        const data = await getFreightForwarders()
        setForwarders(data)
    }

    const handleRequestQuote = async () => {
        if (!selectedForwarder) return

        try {
            const result = await requestQuote({
                forwarderId: selectedForwarder.id,
                originPort: quoteForm.originPort,
                destinationPort: quoteForm.destinationPort,
                cargoType: quoteForm.cargoType,
                commodity: quoteForm.commodity,
                weight: parseFloat(quoteForm.weight),
                volume: parseFloat(quoteForm.volume),
                notes: quoteForm.notes
            })

            if (result?.success) {
                toast.success('Quote request sent! Forwarder akan menghubungi Anda.')
                setSelectedForwarder(null)
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to request quote')
        }
    }

    return (
        <div className="container-custom py-8 space-y-6">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-8 rounded-2xl">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Ship className="w-8 h-8" />
                    Freight Forwarder Marketplace
                </h1>
                <p className="mt-2 opacity-90">
                    Untuk importir & eksportir. Bandingkan harga kirim kontainer LCL/FCL dari berbagai forwarder.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forwarders.map(forwarder => (
                    <Card key={forwarder.id} className="hover:shadow-lg transition-all">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-start justify-between">
                                <div>
                                    {forwarder.company_name}
                                    {forwarder.is_verified && (
                                        <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                                            Verified
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 text-yellow-500 text-sm">
                                    <Star className="w-4 h-4 fill-current" />
                                    {forwarder.rating}
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Services:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {forwarder.services.map((svc: string) => (
                                        <span key={svc} className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                                            {svc}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">Popular Routes:</p>
                                <p className="text-sm mt-1">{forwarder.routes.slice(0, 2).join(', ')}</p>
                            </div>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button 
                                        className="w-full gap-2 mt-3"
                                        onClick={() => setSelectedForwarder(forwarder)}
                                    >
                                        <Send className="w-4 h-4" />
                                        Request Quote
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Request Quote - {forwarder.company_name}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Origin Port</label>
                                                <Input 
                                                    placeholder="e.g. Shanghai"
                                                    value={quoteForm.originPort}
                                                    onChange={e => setQuoteForm({...quoteForm, originPort: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Destination Port</label>
                                                <Input 
                                                    placeholder="e.g. Jakarta"
                                                    value={quoteForm.destinationPort}
                                                    onChange={e => setQuoteForm({...quoteForm, destinationPort: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Cargo Type</label>
                                            <Select 
                                                value={quoteForm.cargoType} 
                                                onValueChange={v => setQuoteForm({...quoteForm, cargoType: v})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="LCL">LCL (Less than Container Load)</SelectItem>
                                                    <SelectItem value="FCL_20">FCL 20ft</SelectItem>
                                                    <SelectItem value="FCL_40">FCL 40ft</SelectItem>
                                                    <SelectItem value="FCL_40HC">FCL 40ft High Cube</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Commodity</label>
                                            <Input 
                                                placeholder="e.g. Electronics, Garments"
                                                value={quoteForm.commodity}
                                                onChange={e => setQuoteForm({...quoteForm, commodity: e.target.value})}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Weight (kg)</label>
                                                <Input 
                                                    type="number"
                                                    placeholder="1000"
                                                    value={quoteForm.weight}
                                                    onChange={e => setQuoteForm({...quoteForm, weight: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Volume (CBM)</label>
                                                <Input 
                                                    type="number"
                                                    placeholder="10"
                                                    value={quoteForm.volume}
                                                    onChange={e => setQuoteForm({...quoteForm, volume: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <Button onClick={handleRequestQuote} className="w-full">
                                            Send Quote Request
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
