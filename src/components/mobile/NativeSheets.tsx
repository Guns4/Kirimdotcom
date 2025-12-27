'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Bottom Sheet / Drawer Component
 * Native app-like panel that slides up from bottom
 * Features: Swipe to close, snap points, backdrop
 */

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    snapPoints?: number[]; // Heights in percentage [25, 50, 90]
    initialSnap?: number;
    className?: string;
}

export function BottomSheet({
    isOpen,
    onClose,
    children,
    title,
    snapPoints = [50, 90],
    initialSnap = 0,
    className,
}: BottomSheetProps) {
    const [currentSnap, setCurrentSnap] = useState(initialSnap);
    const controls = useAnimation();
    const sheetRef = useRef<HTMLDivElement>(null);

    const currentHeight = snapPoints[currentSnap];

    useEffect(() => {
        if (isOpen) {
            controls.start({ y: 0 });
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, controls]);

    const handleDragEnd = (_: any, info: PanInfo) => {
        const threshold = 100;
        const velocity = info.velocity.y;

        if (velocity > 500 || info.offset.y > threshold) {
            // Swipe down - close or snap to lower point
            if (currentSnap > 0) {
                setCurrentSnap(currentSnap - 1);
            } else {
                onClose();
            }
        } else if (velocity < -500 || info.offset.y < -threshold) {
            // Swipe up - snap to higher point
            if (currentSnap < snapPoints.length - 1) {
                setCurrentSnap(currentSnap + 1);
            }
        }
    };

    // Handle back button/gesture
    useEffect(() => {
        const handlePopState = () => {
            if (isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            window.history.pushState({ bottomSheet: true }, '');
            window.addEventListener('popstate', handlePopState);
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        ref={sheetRef}
                        initial={{ y: '100%' }}
                        animate={{ y: `${100 - currentHeight}%` }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.2}
                        onDragEnd={handleDragEnd}
                        className={cn(
                            'fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 shadow-2xl',
                            'touch-none',
                            className
                        )}
                        style={{ height: `${currentHeight}%` }}
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-10 h-1 bg-surface-300 rounded-full" />
                        </div>

                        {/* Header */}
                        {title && (
                            <div className="px-4 pb-3 border-b border-surface-100 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-surface-900">{title}</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-surface-100 rounded-full text-surface-500"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Content */}
                        <div className="overflow-y-auto h-full pb-safe">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

/**
 * Pull to Refresh Component
 * Native app-like refresh gesture
 */

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
    className?: string;
    threshold?: number;
}

export function PullToRefresh({
    onRefresh,
    children,
    className,
    threshold = 80,
}: PullToRefreshProps) {
    const [isPulling, setIsPulling] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const startY = useRef(0);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (containerRef.current?.scrollTop === 0) {
            startY.current = e.touches[0].clientY;
            setIsPulling(true);
        }
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isPulling || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;

        if (diff > 0 && containerRef.current?.scrollTop === 0) {
            e.preventDefault();
            // Apply resistance
            const resistance = 0.4;
            setPullDistance(Math.min(diff * resistance, threshold * 1.5));
        }
    }, [isPulling, isRefreshing, threshold]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling) return;

        if (pullDistance >= threshold && !isRefreshing) {
            setIsRefreshing(true);
            setPullDistance(threshold);

            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
                setPullDistance(0);
            }
        } else {
            setPullDistance(0);
        }

        setIsPulling(false);
    }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    const progress = Math.min(pullDistance / threshold, 1);
    const shouldTrigger = progress >= 1;

    return (
        <div ref={containerRef} className={cn('overflow-y-auto', className)}>
            {/* Pull indicator */}
            <div
                className="flex justify-center items-center overflow-hidden transition-all"
                style={{
                    height: pullDistance,
                    opacity: progress,
                }}
            >
                <div
                    className={cn(
                        'flex items-center gap-2 text-sm',
                        isRefreshing && 'animate-pulse'
                    )}
                >
                    {isRefreshing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-surface-600">Memuat...</span>
                        </>
                    ) : (
                        <>
                            <svg
                                className={cn(
                                    'w-5 h-5 text-primary-500 transition-transform',
                                    shouldTrigger && 'rotate-180'
                                )}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                style={{ transform: `rotate(${progress * 180}deg)` }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                            <span className="text-surface-600">
                                {shouldTrigger ? 'Lepas untuk refresh' : 'Tarik untuk refresh'}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            <div style={{ transform: `translateY(${pullDistance}px)`, transition: isPulling ? 'none' : 'transform 0.2s' }}>
                {children}
            </div>
        </div>
    );
}

/**
 * Mobile Header with Back Button
 * Syncs with browser history
 */

interface MobileHeaderProps {
    title: string;
    onBack?: () => void;
    showBack?: boolean;
    rightAction?: React.ReactNode;
    className?: string;
}

export function MobileHeader({
    title,
    onBack,
    showBack = true,
    rightAction,
    className,
}: MobileHeaderProps) {
    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            window.history.back();
        }
    };

    return (
        <header
            className={cn(
                'sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-surface-100',
                'h-14 flex items-center px-4 safe-top',
                className
            )}
        >
            {showBack && (
                <button
                    onClick={handleBack}
                    className="p-2 -ml-2 hover:bg-surface-100 rounded-full text-surface-600"
                    aria-label="Kembali"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}

            <h1 className="flex-1 text-lg font-semibold text-surface-900 text-center">
                {title}
            </h1>

            {rightAction ? (
                rightAction
            ) : (
                <div className="w-10" /> // Spacer for centering
            )}
        </header>
    );
}

/**
 * Swipe Actions Component
 * For list items with swipe actions (delete, edit)
 */

interface SwipeActionsProps {
    children: React.ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    leftContent?: React.ReactNode;
    rightContent?: React.ReactNode;
    className?: string;
}

export function SwipeActions({
    children,
    onSwipeLeft,
    onSwipeRight,
    leftContent,
    rightContent,
    className,
}: SwipeActionsProps) {
    const [offset, setOffset] = useState(0);
    const startX = useRef(0);

    const handleDragEnd = (_: any, info: PanInfo) => {
        const threshold = 80;

        if (info.offset.x < -threshold && onSwipeLeft) {
            onSwipeLeft();
        } else if (info.offset.x > threshold && onSwipeRight) {
            onSwipeRight();
        }

        setOffset(0);
    };

    return (
        <div className={cn('relative overflow-hidden', className)}>
            {/* Left action */}
            {leftContent && (
                <div
                    className="absolute left-0 top-0 bottom-0 flex items-center bg-success-500 text-white px-4"
                    style={{ opacity: Math.min(offset / 80, 1) }}
                >
                    {leftContent}
                </div>
            )}

            {/* Right action */}
            {rightContent && (
                <div
                    className="absolute right-0 top-0 bottom-0 flex items-center bg-error-500 text-white px-4"
                    style={{ opacity: Math.min(-offset / 80, 1) }}
                >
                    {rightContent}
                </div>
            )}

            {/* Main content */}
            <motion.div
                drag="x"
                dragConstraints={{ left: -100, right: 100 }}
                dragElastic={0.1}
                onDrag={(_, info) => setOffset(info.offset.x)}
                onDragEnd={handleDragEnd}
                className="relative bg-white"
            >
                {children}
            </motion.div>
        </div>
    );
}

export default {
    BottomSheet,
    PullToRefresh,
    MobileHeader,
    SwipeActions,
};
