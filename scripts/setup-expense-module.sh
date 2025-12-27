#!/bin/bash

# Setup Expense Tracker Module
echo "🚀 Setting up Expense Tracker Module..."

# 1. Create Database Migration
echo "🗄️ Creating Database Migration..."
mkdir -p src/utils/supabase/migrations
cat << 'EOF' > src/utils/supabase/migrations/20241227_expenses.sql
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL, -- 'Operational', 'Marketing', 'Salary', 'Other'
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own expenses" ON expenses
    FOR ALL USING (auth.uid() = user_id);
EOF

# 2. Create Server Actions
echo "⚡ Creating Server Actions..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/expenses.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { safeAction } from '@/lib/safe-action'
import { z } from 'zod'

const ExpenseSchema = z.object({
    description: z.string().min(1),
    amount: z.number().min(1),
    category: z.enum(['Operational', 'Marketing', 'Salary', 'Other']),
    date: z.string() // ISO Date YYYY-MM-DD
})

export const getExpenses = async () => {
    const supabase = await createClient()
    const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false })
    return data || []
}

export const createExpense = async (data: z.infer<typeof ExpenseSchema>) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')
        
        const { error } = await supabase.from('expenses').insert({
            user_id: user.id,
            ...data
        })
        
        if (error) throw error
        revalidatePath('/dashboard/expenses')
        return { success: true }
    })
}

export const deleteExpense = async (id: string) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { error } = await supabase.from('expenses').delete().eq('id', id)
        if (error) throw error
        revalidatePath('/dashboard/expenses')
        return { success: true }
    })
}
EOF

# 3. Create UI
echo "🎨 Creating UI Components..."
mkdir -p src/components/expenses
mkdir -p src/app/dashboard/expenses

cat << 'EOF' > src/app/dashboard/expenses/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { getExpenses, createExpense, deleteExpense } from '@/app/actions/expenses'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Wallet, TrendingDown, Calendar, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/ui/EmptyState'

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: 'Operational',
        date: new Date().toISOString().split('T')[0]
    })

    const loadExpenses = async () => {
        setIsLoading(true)
        const data = await getExpenses()
        setExpenses(data)
        setIsLoading(false)
    }

    useEffect(() => {
        loadExpenses()
    }, [])

    const handleSubmit = async () => {
        if (!formData.description || !formData.amount) return
        
        const res = await createExpense({
            ...formData,
            amount: Number(formData.amount),
            category: formData.category as any
        })

        if (res.success) {
            toast.success('Expense recorded')
            setFormData({...formData, description: '', amount: ''})
            loadExpenses()
        } else {
            toast.error('Error recording expense')
        }
    }

    const totalExpense = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0)

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Expense Tracker</h1>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Input Form */}
                <Card className="p-6 md:col-span-1 space-y-4 h-fit">
                    <h2 className="font-semibold flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-red-500" /> Record Expense
                    </h2>
                    <Input 
                        placeholder="Description (e.g., Lakban)" 
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                    <Input 
                        placeholder="Amount (Rp)" 
                        type="number"
                        value={formData.amount}
                        onChange={e => setFormData({...formData, amount: e.target.value})}
                    />
                    <Select 
                        value={formData.category} 
                        onValueChange={v => setFormData({...formData, category: v})}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Operational">Operational (Sehari-hari)</SelectItem>
                            <SelectItem value="Marketing">Marketing (Iklan)</SelectItem>
                            <SelectItem value="Salary">Gaji Karyawan</SelectItem>
                            <SelectItem value="Other">Lainnya</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input 
                         type="date"
                         value={formData.date}
                         onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                    <Button onClick={handleSubmit} className="w-full">Save Expense</Button>
                </Card>

                {/* List & Stats */}
                <div className="md:col-span-2 space-y-4">
                    <Card className="p-4 bg-red-50 border-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                        <p className="text-sm">Total Pengeluaran Bulan Ini</p>
                        <p className="text-3xl font-bold">Rp {totalExpense.toLocaleString()}</p>
                    </Card>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border p-4 max-h-[500px] overflow-y-auto space-y-2">
                        {isLoading ? (
                            <div>Loading...</div>
                        ) : expenses.length === 0 ? (
                            <EmptyState 
                                title="No Expenses" 
                                description="Your expense history will appear here." 
                                icon={Wallet} 
                            />
                        ) : (
                            expenses.map(ex => (
                                <div key={ex.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg group">
                                    <div className="flex gap-3">
                                        <div className="p-2 bg-gray-100 rounded text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{ex.description}</p>
                                            <p className="text-xs text-gray-400">{ex.date} • {ex.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-semibold text-red-600">- Rp {Number(ex.amount).toLocaleString()}</span>
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"
                                            onClick={async () => {
                                                if(confirm('Delete?')) {
                                                    await deleteExpense(ex.id);
                                                    loadExpenses();
                                                }
                                            }}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
EOF

echo "✅ Expense Module Setup Complete!"
