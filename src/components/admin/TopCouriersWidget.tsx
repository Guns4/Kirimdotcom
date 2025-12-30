'use client';

import { useEffect, useState } from 'react';
import { getTopCouriers } from '@/app/actions/analyticsActions';
import { BarChart3 } from 'lucide-react';

export default function TopCouriersWidget() {
  const [data, setData] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopCouriers().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm h-64 animate-pulse bg-gray-100" />
    );

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
          <BarChart3 className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-zinc-900 dark:text-white">
          Top Couriers
        </h3>
      </div>

      <div className="space-y-4">
        {data.length === 0 ? (
          <p className="text-zinc-500 text-sm">No data recorded yet.</p>
        ) : (
          data.map((item) => (
            <div key={item.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-300 capitalize">
                  {item.name}
                </span>
                <span className="text-zinc-500">{item.count} searches</span>
              </div>
              <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
