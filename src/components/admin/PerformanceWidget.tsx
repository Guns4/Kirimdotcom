'use client';

import { Activity, Zap } from 'lucide-react';

// Mock data - replace with SWR fetch from your analytics DB
const dummyData = {
  lcp: 1200, // Good
  cls: 0.15, // Needs Improvement
  inp: 80, // Good
};

function getStatus(metric: 'lcp' | 'cls' | 'inp', value: number) {
  if (metric === 'lcp')
    return value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor';
  if (metric === 'cls')
    return value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor';
  if (metric === 'inp')
    return value < 200 ? 'good' : value < 500 ? 'needs-improvement' : 'poor';
  return 'good';
}

const colors = {
  good: 'text-green-600 bg-green-50 border-green-200',
  'needs-improvement': 'text-yellow-600 bg-yellow-50 border-yellow-200',
  poor: 'text-red-600 bg-red-50 border-red-200',
};

export function PerformanceWidget() {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          Core Web Vitals
        </h3>
        <span className="text-xs text-gray-500">Last 24h Avg</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* LCP */}
        <div
          className={`p-3 rounded-lg border text-center ${colors[getStatus('lcp', dummyData.lcp)]}`}
        >
          <div className="text-xs font-semibold opacity-80">LCP</div>
          <div className="font-bold text-lg">
            {(dummyData.lcp / 1000).toFixed(1)}s
          </div>
        </div>

        {/* CLS */}
        <div
          className={`p-3 rounded-lg border text-center ${colors[getStatus('cls', dummyData.cls)]}`}
        >
          <div className="text-xs font-semibold opacity-80">CLS</div>
          <div className="font-bold text-lg">{dummyData.cls.toFixed(2)}</div>
        </div>

        {/* INP */}
        <div
          className={`p-3 rounded-lg border text-center ${colors[getStatus('inp', dummyData.inp)]}`}
        >
          <div className="text-xs font-semibold opacity-80">INP</div>
          <div className="font-bold text-lg">{dummyData.inp}ms</div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-400 flex items-center gap-1">
        <Zap className="w-3 h-3" />
        Real-user data based on Chrome usage
      </div>
    </div>
  );
}

// Add default export for import compatibility
export default PerformanceWidget;
