import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../ui/StatCard';
import { DollarSign, Users, Package, Activity } from 'lucide-react';

const data = [
    { name: 'Mon', revenue: 4000, users: 24 },
    { name: 'Tue', revenue: 3000, users: 18 },
    { name: 'Wed', revenue: 2000, users: 50 },
    { name: 'Thu', revenue: 2780, users: 39 },
    { name: 'Fri', revenue: 1890, users: 40 },
    { name: 'Sat', revenue: 2390, users: 60 },
    { name: 'Sun', revenue: 3490, users: 70 },
];

export default function OverviewView() {
    return (
        <div className="space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value="Rp 12.5M" icon={DollarSign} color="green" trend="+12% this week" />
                <StatCard title="Active Users" value="1,204" icon={Users} color="blue" trend="+5 new today" />
                <StatCard title="Total Orders" value="854" icon={Package} color="purple" trend="32 pending" />
                <StatCard title="System Load" value="12%" icon={Activity} color="orange" trend="Stable" />
            </div>

            {/* Main Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border h-96">
                <h3 className="font-bold text-slate-700 mb-4">Traffic & Revenue Analytics</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" />
                        <Area type="monotone" dataKey="users" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
