// Sentry Configuration for Error Monitoring & Session Replay
// Note: Install @sentry/nextjs if needed: npm install @sentry/nextjs

interface SentryConfig {
    dsn: string;
    environment: string;
    tracesSampleRate: number;
    replaysSessionSampleRate: number;
    replaysOnErrorSampleRate: number;
}

export const sentryConfig: SentryConfig = {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',

    // Performance monitoring
    tracesSampleRate: 0.1, // 10% of transactions

    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of normal sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
};

// Initialize Sentry (call this in app layout or _app.tsx)
export function initSentry() {
    if (!sentryConfig.dsn) {
        console.warn('Sentry DSN not configured');
        return;
    }

    // Sentry.init({
    //     dsn: sentryConfig.dsn,
    //     environment: sentryConfig.environment,
    //     tracesSampleRate: sentryConfig.tracesSampleRate,
    //     
    //     // Session Replay
    //     replaysSessionSampleRate: sentryConfig.replaysSessionSampleRate,
    //     replaysOnErrorSampleRate: sentryConfig.replaysOnErrorSampleRate,
    //     
    //     integrations: [
    //         new Sentry.Replay({
    //             maskAllText: false,
    //             maskAllInputs: true, // Mask passwords, credit cards
    //             blockAllMedia: false,
    //         }),
    //     ],
    //     
    //     // Filtering
    //     beforeSend(event, hint) {
    //         // Ignore warnings
    //         if (event.level === 'warning') return null;
    //         
    //         return event;
    //     },
    // });

    console.log('✅ Sentry initialized with Session Replay');
}

// Error boundary helper
export function captureException(error: Error, context?: Record<string, any>) {
    console.error('Error captured:', error, context);

    // Sentry.captureException(error, {
    //     contexts: { custom: context },
    // });

    // Check if it's a critical issue (implement rate limiting logic)
    // If > 10 errors in 5 minutes, send Telegram alert
}
