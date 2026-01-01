import { LucideIcon } from 'lucide-react';

interface Props {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    color?: 'blue' | 'green' | 'red' | 'purple' | 'orange';
}

export default function StatCard({ title, value, icon: Icon, trend, color = 'blue' }: Props) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        red: 'bg-red-50 text-red-600 border-red-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
    };

    return (
        <div className={`p-6 rounded-xl border ${colorClasses[color]} shadow-sm transition hover:shadow-md`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium opacity-80 uppercase tracking-wide">{title}</p>
                    <h3 className="text-3xl font-black mt-1">{value}</h3>
                </div>
                <div className={`p-2 rounded-lg bg-white/50`}>
                    <Icon size={24} />
                </div>
            </div>
            {trend && <p className="text-xs mt-3 font-medium opacity-70">{trend}</p>}
        </div>
    );
}
