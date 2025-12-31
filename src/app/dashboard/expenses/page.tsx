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
