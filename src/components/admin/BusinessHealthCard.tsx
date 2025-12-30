'use client';

import { BusinessMetrics } from '@/app/actions/admin-metrics';
import {
  TrendingUp,
  Users,
  Database,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface BusinessHealthCardProps {
  metrics: BusinessMetrics;
}

export function BusinessHealthCard({ metrics }: BusinessHealthCardProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-indigo-400" />
        Kesehatan Bisnis
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revenue Card */}
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-24 h-24 text-green-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">
              Estimasi Revenue (Bulan Ini)
            </p>
            <h3 className="text-2xl font-bold text-white mb-2">
              {formatCurrency(metrics.revenue.total)}
            </h3>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-white/5 text-gray-300">
                Ads: {formatCurrency(metrics.revenue.ads)}
              </span>
              <span className="px-2 py-1 rounded bg-white/5 text-gray-300">
                Aff: {formatCurrency(metrics.revenue.affiliate)}
              </span>
            </div>
          </div>
        </div>

        {/* Retention Card */}
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-24 h-24 text-blue-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">
              User Retention (7 Hari)
            </p>
            <h3 className="text-2xl font-bold text-white mb-2">
              {metrics.retention.returningUsers}%
            </h3>
            <p className="text-xs text-blue-300">
              ~{metrics.retention.activeUsers7Days} User Aktif Mingguan
            </p>
          </div>
        </div>

        {/* Cost/Supabase Card */}
        <div
          className={`glass-card p-5 relative overflow-hidden group border ${
            metrics.supabase.prediction === 'critical'
              ? 'border-red-500/30'
              : metrics.supabase.prediction === 'warning'
                ? 'border-yellow-500/30'
                : 'border-white/10'
          }`}
        >
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Database
              className={`w-24 h-24 ${
                metrics.supabase.prediction === 'critical'
                  ? 'text-red-400'
                  : 'text-purple-400'
              }`}
            />
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">
              Supabase Load Estimator
            </p>
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              {metrics.supabase.reads.toLocaleString()}{' '}
              <span className="text-sm font-normal text-gray-500">Ops</span>
            </h3>

            {metrics.supabase.prediction !== 'safe' && (
              <div className="flex items-center gap-1.5 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded w-fit">
                <AlertCircle className="w-3 h-3" />
                {metrics.supabase.prediction === 'critical'
                  ? 'Mendekati Limit Free Tier!'
                  : 'Usage Mulai Tinggi'}
              </div>
            )}
            {metrics.supabase.prediction === 'safe' && (
              <p className="text-xs text-green-400">Usage Aman (Free Tier)</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
