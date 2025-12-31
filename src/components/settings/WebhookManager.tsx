'use client'

import { useState, useEffect } from 'react'
import { createWebhook, getWebhooks } from '@/app/actions/webhooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Trash, Plus, Activity } from 'lucide-react'
import { toast } from 'sonner'

export function WebhookManager() {
    const [hooks, setHooks] = useState<any[]>([])
    const [newUrl, setNewUrl] = useState('')
    const [newEvent, setNewEvent] = useState('PACKAGE_DELIVERED')

    useEffect(() => {
        loadHooks()
    }, [])

    const loadHooks = () => getWebhooks().then(setHooks)

    const handleAdd = async () => {
        try {
            await createWebhook({ url: newUrl, event_type: newEvent })
            toast.success('Webhook created')
            setNewUrl('')
            loadHooks()
        } catch (e) {
            toast.error('Failed to create webhook')
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" /> Webhook Integrations
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input 
                        placeholder="https://hooks.zapier.com/..." 
                        value={newUrl}
                        onChange={e => setNewUrl(e.target.value)}
                    />
                    <Select value={newEvent} onValueChange={setNewEvent}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PACKAGE_DELIVERED">Delivered</SelectItem>
                            <SelectItem value="TRACKING_UPDATED">Updated</SelectItem>
                            <SelectItem value="ORDER_CREATED">Order Created</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleAdd}><Plus className="w-4 h-4" /></Button>
                </div>

                <div className="space-y-2">
                    {hooks.map(h => (
                        <div key={h.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                            <div className="truncate flex-1 mr-4">
                                <div className="font-medium text-sm">{h.event_type}</div>
                                <div className="text-xs text-gray-500 truncate">{h.url}</div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                <Trash className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
