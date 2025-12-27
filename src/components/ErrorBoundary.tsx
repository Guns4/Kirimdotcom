'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Error Boundary Component
 * Catches JavaScript errors and displays friendly fallback UI
 */

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center p-8 bg-warning-50 border border-warning-200 rounded-xl text-center my-4">
                    {/* Warning Icon */}
                    <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <h3 className="text-lg font-semibold text-warning-800 mb-2">
                        Maaf, ada gangguan kecil
                    </h3>
                    <p className="text-sm text-warning-600 mb-4">
                        Jangan khawatir, hanya bagian ini yang bermasalah.
                    </p>

                    <div className="flex gap-3">
                        <Button variant="outline" size="sm" onClick={this.handleRetry}>
                            Coba Lagi
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
                            Refresh Halaman
                        </Button>
                    </div>

                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details className="mt-4 text-left w-full">
                            <summary className="text-xs text-warning-600 cursor-pointer">
                                Detail Error (Dev Only)
                            </summary>
                            <pre className="mt-2 p-3 bg-surface-900 text-surface-100 rounded text-xs overflow-x-auto">
                                {this.state.error.message}
                                {'\n\n'}
                                {this.state.error.stack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Hook version for functional components
 */
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundary(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    };
}

/**
 * Inline Error Display (for smaller sections)
 */
export function InlineError({
    message = 'Gagal memuat data',
    onRetry,
}: {
    message?: string;
    onRetry?: () => void;
}) {
    return (
        <div className="flex items-center gap-3 p-4 bg-error-50 border border-error-100 rounded-lg">
            <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-error-800">{message}</p>
            </div>
            {onRetry && (
                <Button variant="ghost" size="sm" onClick={onRetry}>
                    Coba Lagi
                </Button>
            )}
        </div>
    );
}

export default ErrorBoundary;
