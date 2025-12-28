import { logEvent } from "@/app/actions/analyticsActions";

/**
 * Track a user event (Client Side)
 * @param eventName Name of the event (e.g., 'click_cek_resi')
 * @param properties Additional data (e.g., { courier: 'jne' })
 */
export const trackEvent = async (eventName: string, properties: Record<string, any> = {}) => {
    try {
        // 1. Log to Supabase (Server Action)
        await logEvent(eventName, properties);

        // 2. Optional: Log to Console in Dev
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Tracking] ${eventName}`, properties);
        }

        // 3. Optional: Forward to GA4/Clarity/Pixel if exists
        // if (window.gtag) window.gtag('event', eventName, properties);

    } catch (error) {
        // tracking should never crash the app
        console.warn('Tracking failed:', error);
    }
};
