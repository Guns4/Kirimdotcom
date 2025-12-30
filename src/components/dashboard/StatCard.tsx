'use client';

import { cn } from '@/lib/utils';

/**
 * Stat Cards - Dashboard KPI Display
 * Features: Large icons, bold numbers, trend indicators
 */

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning';
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  change,
  variant = 'default',
  className,
}: StatCardProps) {
  const variants = {
    default: 'bg-white',
    primary: 'bg-primary-50 border-primary-100',
    secondary: 'bg-secondary-50 border-secondary-100',
    success: 'bg-success-50 border-success-100',
    warning: 'bg-warning-50 border-warning-100',
  };

  const iconBg = {
    default: 'bg-surface-100',
    primary: 'bg-primary-100 text-primary-600',
    secondary: 'bg-secondary-100 text-secondary-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-surface-100 p-5 transition-all hover:shadow-soft',
        variants[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
            iconBg[variant]
          )}
        >
          {icon}
        </div>

        {/* Trend */}
        {change && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              change.type === 'increase' && 'bg-success-100 text-success-700',
              change.type === 'decrease' && 'bg-error-100 text-error-700',
              change.type === 'neutral' && 'bg-surface-100 text-surface-600'
            )}
          >
            {change.type === 'increase' && '↑'}
            {change.type === 'decrease' && '↓'}
            {change.value}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-surface-900">{value}</h3>
        <p className="text-sm text-surface-500 mt-1">{title}</p>
      </div>
    </div>
  );
}

// Stat Card Grid
export function StatCardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {children}
    </div>
  );
}

// Mini Stat (Inline)
export function MiniStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-surface-100">
      {icon && <span className="text-lg">{icon}</span>}
      <div>
        <p className="text-xs text-surface-500">{label}</p>
        <p className="text-sm font-semibold text-surface-800">{value}</p>
      </div>
    </div>
  );
}

export default StatCard;
