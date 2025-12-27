#!/bin/bash

# Setup Outbound Webhooks Module
echo "🚀 Setting up Webhook System..."

# 1. Create Database Migration
echo "🗄️ Creating Database Migration..."
mkdir -p src/utils/supabase/migrations
cat << 'EOF' > src/utils/supabase/migrations/20241227_webhooks.sql
CREATE TABLE IF NOT EXISTS user_webhooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'ORDER_CREATED', 'TRACKING_UPDATED', 'PACKAGE_DELIVERED'
    secret TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_id UUID REFERENCES user_webhooks(id) ON DELETE CASCADE,
    payload JSONB,
    response_status INTEGER,
    response_body TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own webhooks" ON user_webhooks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own logs" ON webhook_logs FOR SELECT USING (EXISTS (SELECT 1 FROM user_webhooks WHERE id = webhook_id AND user_id = auth.uid()));
EOF

# 2. Create Server Actions
echo "⚡ Creating Server Actions..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/webhooks.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'

export const createWebhook = async (data: any) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const { error } = await supabase.from('user_webhooks').insert({
            user_id: user.id,
            ...data
        })
        
        if (error) throw error
        return { success: true }
    })
}

export const getWebhooks = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase.from('user_webhooks').select('*').eq('user_id', user.id)
    return data || []
}

// Internal function to call (not exposed as action)
export const dispatchWebhook = async (userId: string, event: string, payload: any) => {
    const supabase = await createClient()
    
    // 1. Find matching webhooks
    const { data: hooks } = await supabase.from('user_webhooks')
        .select('*')
        .eq('user_id', userId)
        .eq('event_type', event)
        .eq('is_active', true)

    if (!hooks || hooks.length === 0) return

    // 2. Fire and Forget (Async)
    hooks.forEach(async (hook) => {
        try {
            const res = await fetch(hook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Webhook-Secret': hook.secret || '' },
                body: JSON.stringify({ event, payload, timestamp: new Date() })
            })
            
            // Log Result
            await supabase.from('webhook_logs').insert({
                webhook_id: hook.id,
                payload,
                response_status: res.status,
                response_body: await res.text().catch(() => '')
            })
        } catch (e: any) {
            console.error('Webhook failed', e)
            await supabase.from('webhook_logs').insert({
                webhook_id: hook.id,
                payload,
                response_status: 0,
                response_body: e.message
            })
        }
    })
}
EOF

# 3. Create UI
echo "🎨 Creating Webhook Settings UI..."
mkdir -p src/components/settings
cat << 'EOF' > src/components/settings/WebhookManager.tsx
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
EOF

echo "✅ Webhooks Module Setup Complete!"
