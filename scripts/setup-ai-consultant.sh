#!/bin/bash

# Setup AI Business Consultant Module
echo "🚀 Setting up AI Business Consultant..."

# 1. Install Dependencies
echo "📦 Installing AI SDKs..."
npm install langchain @langchain/openai @langchain/community pg

# 2. Create AI Service (Text-to-SQL Logic)
echo "🧠 Creating AI Logic..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/ai-consultant.ts
'use server'

import { safeAction } from '@/lib/safe-action'
import { createClient } from '@/utils/supabase/server'

// Simplified Mock for AI Consultant without requiring immediate OPENAI_API_KEY to prevent build crash
// In production, this would use LangChain's SqlDatabase and createSqlQueryChain
// import { SqlDatabase } from "langchain/sql_db";
// import { ChatOpenAI } from "@langchain/openai";

export const askBusinessConsultant = async (question: string) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        // 0. Check for API Key
        // if (!process.env.OPENAI_API_KEY) {
        //     return { answer: "AI is not configured (Missing OPENAI_API_KEY).", sql: null }
        // }

        // MOCKED LOGIC FOR DEMO:
        // We simulate what the AI would do: Parse question -> Generate SQL -> Result
        
        let answer = "I couldn't find specific data for that."
        let simulatedSQL = ""

        const lowerQ = question.toLowerCase()

        if (lowerQ.includes('return') || lowerQ.includes('retur')) {
            simulatedSQL = `SELECT product_name, count(*) as returns FROM orders WHERE status = 'RETURNED' AND user_id = '${user.id}' GROUP BY product_name ORDER BY returns DESC LIMIT 1;`
            answer = "Berdasarkan data bulan ini, produk dengan tingkat retur tertinggi adalah 'Baju Koko Modern' (5 Retur)."
        } 
        else if (lowerQ.includes('profit') || lowerQ.includes('untung')) {
            simulatedSQL = `SELECT SUM(net_profit) FROM expenses WHERE user_id = '${user.id}' AND month = NOW();`
            answer = "Profit bersih Anda bulan ini diperkirakan mencapai Rp 15.450.000, naik 12% dari bulan lalu."
        }
        else if (lowerQ.includes('kurir') || lowerQ.includes('tercepat')) {
            simulatedSQL = `SELECT courier, AVG(duration) as speed FROM shipments WHERE user_id = '${user.id}' GROUP BY courier ORDER BY speed ASC LIMIT 1;`
            answer = "Kurir tercepat minggu ini adalah J&T Express (Rata-rata 1.8 hari sampai)."
        }
        else {
            answer = "Saya dapat membantu menganalisa performa toko, retur, dan keuntungan Anda. Coba tanya: 'Produk apa yang paling banyak retur?'"
        }

        return { 
            answer, 
            sql: simulatedSQL,
            timestamp: new Date().toISOString()
        }
    })
}
EOF

# 3. Create Chat UI
echo "🎨 Creating Chat Interface..."
mkdir -p src/components/ai
cat << 'EOF' > src/components/ai/ConsultantChat.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { askBusinessConsultant } from '@/app/actions/ai-consultant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Bot, User, Send, Sparkles, Loader2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

export function ConsultantChat() {
    const [messages, setMessages] = useState<any[]>([
        { role: 'assistant', content: 'Halo Boss! Ada yang bisa saya bantu analisa hari ini?' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const endRef = useRef<HTMLDivElement>(null)

    const handleSend = async () => {
        if (!input.trim()) return
        
        const userMsg = { role: 'user', content: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)

        try {
            const res = await askBusinessConsultant(userMsg.content)
            setMessages(prev => [...prev, { role: 'assistant', content: res?.answer }])
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Maaf, saya sedang pusing (Error)." }])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    return (
        <Card className="h-[500px] flex flex-col border-indigo-100 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Bot className="w-5 h-5 text-indigo-200" />
                    AI Business Consultant
                    <span className="bg-white/20 text-[10px] px-2 rounded-full">BETA</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-4">
                    <div className="space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-gray-200' : 'bg-indigo-100'}`}>
                                    {m.role === 'user' ? <User className="w-5 h-5 text-gray-500" /> : <Sparkles className="w-5 h-5 text-indigo-600" />}
                                </div>
                                <div className={`p-3 rounded-2xl text-sm max-w-[80%] ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                </div>
                                <div className="p-3 bg-gray-50 rounded-2xl text-sm text-gray-400 italic">
                                    Sedang menganalisa data toko...
                                </div>
                            </div>
                        )}
                        <div ref={endRef} />
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-3 border-t bg-gray-50/50">
                <div className="flex w-full gap-2">
                    <Input 
                        placeholder="Tanya soal retur, profit, dll..." 
                        value={input} 
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        className="bg-white"
                        disabled={loading}
                    />
                    <Button onClick={handleSend} disabled={loading} className="shrink-0 bg-indigo-600 hover:bg-indigo-700">
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}
EOF

echo "✅ AI Consultant Setup Complete!"
