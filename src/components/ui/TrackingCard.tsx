'use client';

import { motion } from 'framer-motion';
import { Package, MapPin, CheckCircle2, Truck, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Tracking Status Types
export type TrackingStatus = 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';

export interface TrackingStep {
    date: string;
    time: string;
    description: string;
    location?: string;
    status?: TrackingStatus;
}

interface TrackingCardProps {
    variant?: 'default' | 'lite' | 'timeline' | 'compact';
    title?: string;
    awb?: string;
    courier?: string;
    status?: TrackingStatus;
    steps?: TrackingStep[];
    isLoading?: boolean;
    className?: string;
    children?: React.ReactNode;
}

// Status color mapping
const statusStyles: Record<TrackingStatus, { bg: string; text: string; icon: React.ElementType }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
    in_transit: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Truck },
    out_for_delivery: { bg: 'bg-purple-100', text: 'text-purple-700', icon: MapPin },
    delivered: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
    failed: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
};

// Status label mapping
const statusLabels: Record<TrackingStatus, string> = {
    pending: 'Menunggu Pickup',
    in_transit: 'Dalam Pengiriman',
    out_for_delivery: 'Sedang Diantar',
    delivered: 'Terkirim',
    failed: 'Gagal',
};

export function TrackingCard({
    variant = 'default',
    title,
    awb,
    courier,
    status = 'pending',
    steps = [],
    isLoading,
    className = '',
    children
}: TrackingCardProps) {
    const StatusIcon = statusStyles[status]?.icon || Package;

    // Loading State
    if (isLoading) {
        return (
            <div className={cn('bg-white p-6 border border-gray-200 rounded-xl animate-pulse', className)}>
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
            </div>
        );
    }

    // Compact Mode (for lists)
    if (variant === 'compact') {
        return (
            <div className={cn('bg-white p-4 border border-gray-200 rounded-lg flex items-center gap-4', className)}>
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', statusStyles[status]?.bg)}>
                    <StatusIcon className={cn('w-5 h-5', statusStyles[status]?.text)} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{awb}</p>
                    <p className="text-sm text-gray-500">{courier}</p>
                </div>
                <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusStyles[status]?.bg, statusStyles[status]?.text)}>
                    {statusLabels[status]}
                </span>
            </div>
        );
    }

    // Lite Mode (Minimalist)
    if (variant === 'lite') {
        return (
            <div className={cn('bg-white p-6 border border-gray-200 shadow-sm rounded-xl', className)}>
                {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}

                {awb && (
                    <div className="flex items-center gap-3 mb-4">
                        <Package className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500">No. Resi</p>
                            <p className="font-mono font-semibold text-gray-900">{awb}</p>
                        </div>
                    </div>
                )}

                {children}
            </div>
        );
    }

    // Timeline Mode (with steps)
    if (variant === 'timeline' && steps.length > 0) {
        return (
            <div className={cn('bg-white p-6 border border-gray-200 shadow-sm rounded-xl', className)}>
                {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}

                <div className="relative">
                    {steps.map((step, index) => (
                        <div key={index} className="flex gap-4 pb-6 last:pb-0">
                            {/* Timeline line */}
                            <div className="flex flex-col items-center">
                                <div className={cn(
                                    'w-3 h-3 rounded-full',
                                    index === 0 ? 'bg-primary-500' : 'bg-gray-300'
                                )} />
                                {index < steps.length - 1 && (
                                    <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 -mt-1">
                                <p className="text-sm font-medium text-gray-900">{step.description}</p>
                                {step.location && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                        <MapPin className="w-3 h-3" />
                                        {step.location}
                                    </p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                    {step.date} • {step.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {children}
            </div>
        );
    }

    // Default Mode (Glassmorphism with status)
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm p-6 border border-gray-200/50 rounded-2xl shadow-lg', className)}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    {title && <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>}
                    {awb && (
                        <p className="font-mono text-sm text-gray-600">{awb}</p>
                    )}
                </div>

                {/* Status Badge */}
                <div className={cn('px-3 py-1.5 rounded-full flex items-center gap-2', statusStyles[status]?.bg)}>
                    <StatusIcon className={cn('w-4 h-4', statusStyles[status]?.text)} />
                    <span className={cn('text-sm font-medium', statusStyles[status]?.text)}>
                        {statusLabels[status]}
                    </span>
                </div>
            </div>

            {/* Courier Info */}
            {courier && (
                <div className="flex items-center gap-2 mb-4 text-gray-600">
                    <Truck className="w-4 h-4" />
                    <span className="text-sm">{courier}</span>
                </div>
            )}

            {children}
        </motion.div>
    );
}

export default TrackingCard;
