'use client'

import { useState, useEffect } from 'react'
import { getCustomers } from '@/app/actions/crm'
import { Input } from '@/components/ui/input'
import { Search, User, Trophy } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/badge'

export default function CRMDashboard() {
    const [customers, setCustomers] = useState<any[]>([])
    const [query, setQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => loadCustomers(), 500)
        return () => clearTimeout(timer)
    }, [query])

    const loadCustomers = async () => {
        setIsLoading(true)
        const data = await getCustomers(query)
        setCustomers(data)
        setIsLoading(false)
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Customer Database (CRM)</h1>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by name or phone..."
                        className="pl-9"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : customers.length === 0 ? (
                <EmptyState
                    title="No Customers Found"
                    description="Customers will appear here automatically when you create orders."
                    icon={User}
                />
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500">
                            <tr>
                                <th className="p-4 font-medium">Customer</th>
                                <th className="p-4 font-medium">Contact</th>
                                <th className="p-4 font-medium">Orders</th>
                                <th className="p-4 font-medium">Total Spend</th>
                                <th className="p-4 font-medium">Tags</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {customers.map((c, i) => (
                                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                    <td className="p-4 font-medium flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                                            {c.name.substring(0, 2)}
                                        </div>
                                        {c.name}
                                        {i < 3 && <Trophy className="w-3 h-3 text-yellow-500" />}
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        <div>{c.phone || '-'}</div>
                                        <div className="text-xs">{c.email}</div>
                                    </td>
                                    <td className="p-4">{c.orders_count}</td>
                                    <td className="p-4 text-green-600 font-mono">
                                        Rp {Number(c.total_spend).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        {Number(c.total_spend) > 1000000 ? (
                                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-none">VIP</Badge>
                                        ) : (
                                            <Badge variant="outline">Regular</Badge>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
