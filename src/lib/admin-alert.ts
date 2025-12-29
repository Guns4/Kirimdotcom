/**
 * Admin Alert System
 * Sends notifications to admin when critical events occur
 */

interface AlertOptions {
    subject: string;
    message: string;
    severity?: 'info' | 'warning' | 'error' | 'critical';
    metadata?: Record<string, any>;
}

/**
 * Send alert to admin via email or notification service
 */
export async function sendAdminAlert(options: AlertOptions): Promise<void> {
    const { subject, message, severity = 'info', metadata } = options;

    try {
        // Log to console for now
        console.log(`
[ADMIN ALERT - ${severity.toUpperCase()}]
Subject: ${subject}
Message: ${message}
Metadata: ${JSON.stringify(metadata, null, 2)}
Timestamp: ${new Date().toISOString()}
        `);

        // TODO: Implement actual notification service
        // Options:
        // 1. Send email via Resend/SendGrid
        // 2. Send Slack notification
        // 3. Send Discord webhook
        // 4. Store in database notifications table

        // Example: Email implementation
        /*
        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'alerts@cekkirim.com',
                to: 'admin@cekkirim.com',
                subject: `[${severity.toUpperCase()}] ${subject}`,
                html: `
                    <h2>${subject}</h2>
                    <p>${message}</p>
                    <pre>${JSON.stringify(metadata, null, 2)}</pre>
                `
            })
        });
        */

    } catch (error) {
        // Don't throw - we don't want alert failures to break the main flow
        console.error('Failed to send admin alert:', error);
    }
}

/**
 * Quick alert helpers for common scenarios
 */
export const adminAlert = {
    info: (subject: string, message: string, metadata?: Record<string, any>) =>
        sendAdminAlert({ subject, message, severity: 'info', metadata }),

    warning: (subject: string, message: string, metadata?: Record<string, any>) =>
        sendAdminAlert({ subject, message, severity: 'warning', metadata }),

    error: (subject: string, message: string, metadata?: Record<string, any>) =>
        sendAdminAlert({ subject, message, severity: 'error', metadata }),

    critical: (subject: string, message: string, metadata?: Record<string, any>) =>
        sendAdminAlert({ subject, message, severity: 'critical', metadata }),
};
