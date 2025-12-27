'use client';

import { cn } from '@/lib/utils';

/**
 * Skeleton Loading Components
 * Pulsing placeholder for content loading
 */

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Base Skeleton
export function Skeleton({
    className,
    width,
    height,
    rounded = 'lg',
}: SkeletonProps) {
    const roundedClass = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
    };

    return (
        <div
            className={cn(
                'animate-pulse bg-gradient-to-r from-surface-200 via-surface-100 to-surface-200 bg-[length:200%_100%]',
                roundedClass[rounded],
                className
            )}
            style={{
                width: width,
                height: height,
                animation: 'shimmer 1.5s ease-in-out infinite',
            }}
        />
    );
}

// Text Line Skeleton
export function SkeletonText({
    lines = 3,
    className,
}: {
    lines?: number;
    className?: string;
}) {
    return (
        <div className={cn('space-y-3', className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    height="12px"
                    className={i === lines - 1 ? 'w-3/4' : 'w-full'}
                />
            ))}
        </div>
    );
}

// Avatar Skeleton
export function SkeletonAvatar({
    size = 'md',
    className,
}: {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}) {
    const sizeClass = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    return <Skeleton rounded="full" className={cn(sizeClass[size], className)} />;
}

// Card Skeleton
export function SkeletonCard({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'p-4 bg-white rounded-xl border border-surface-100',
                className
            )}
        >
            <div className="flex items-start gap-4">
                <SkeletonAvatar size="lg" />
                <div className="flex-1 space-y-2">
                    <Skeleton height="16px" className="w-1/2" />
                    <Skeleton height="12px" className="w-full" />
                    <Skeleton height="12px" className="w-3/4" />
                </div>
            </div>
        </div>
    );
}

// Table Row Skeleton
export function SkeletonTableRow({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="border-b border-surface-100">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <Skeleton height="14px" className={i === 0 ? 'w-3/4' : 'w-full'} />
                </td>
            ))}
        </tr>
    );
}

// Table Skeleton
export function SkeletonTable({
    rows = 5,
    columns = 5,
    className,
}: {
    rows?: number;
    columns?: number;
    className?: string;
}) {
    return (
        <div className={cn('bg-white rounded-xl border border-surface-100 overflow-hidden', className)}>
            {/* Header */}
            <div className="bg-surface-50 border-b border-surface-100 px-4 py-3 flex gap-4">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} height="12px" className="flex-1" />
                ))}
            </div>
            {/* Rows */}
            <table className="w-full">
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <SkeletonTableRow key={i} columns={columns} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Stat Card Skeleton
export function SkeletonStatCard({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'p-5 bg-white rounded-xl border border-surface-100',
                className
            )}
        >
            <div className="flex items-start justify-between">
                <Skeleton width="48px" height="48px" rounded="xl" />
                <Skeleton width="40px" height="20px" rounded="full" />
            </div>
            <div className="mt-4 space-y-2">
                <Skeleton height="28px" className="w-1/2" />
                <Skeleton height="14px" className="w-3/4" />
            </div>
        </div>
    );
}

// Image Skeleton
export function SkeletonImage({
    aspectRatio = '16/9',
    className,
}: {
    aspectRatio?: string;
    className?: string;
}) {
    return (
        <div
            className={cn('relative overflow-hidden rounded-xl', className)}
            style={{ aspectRatio }}
        >
            <Skeleton className="absolute inset-0" rounded="xl" />
            <div className="absolute inset-0 flex items-center justify-center text-surface-300">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
            </div>
        </div>
    );
}

// Tracking Result Skeleton
export function SkeletonTrackingResult({ className }: { className?: string }) {
    return (
        <div className={cn('space-y-4', className)}>
            {/* Header */}
            <div className="p-4 bg-white rounded-xl border border-surface-100">
                <div className="flex items-center gap-4">
                    <Skeleton width="60px" height="60px" rounded="lg" />
                    <div className="flex-1 space-y-2">
                        <Skeleton height="18px" className="w-1/2" />
                        <Skeleton height="14px" className="w-3/4" />
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="p-4 bg-white rounded-xl border border-surface-100 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <Skeleton width="12px" height="12px" rounded="full" />
                            {i < 4 && <Skeleton width="2px" height="40px" className="my-1" />}
                        </div>
                        <div className="flex-1 space-y-1 pb-4">
                            <Skeleton height="14px" className="w-2/3" />
                            <Skeleton height="12px" className="w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default {
    Skeleton,
    SkeletonText,
    SkeletonAvatar,
    SkeletonCard,
    SkeletonTable,
    SkeletonTableRow,
    SkeletonStatCard,
    SkeletonImage,
    SkeletonTrackingResult,
};
