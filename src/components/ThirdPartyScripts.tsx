'use client';

import Script from 'next/script';

interface ThirdPartyScriptsProps {
    gaId?: string;
    adsenseId?: string;
    monetagId?: string;
    crispId?: string;
}

/**
 * Third-Party Scripts Component
 * Handles all external scripts with optimal loading strategy
 * 
 * Loading Strategies:
 * - beforeInteractive: Critical scripts (rarely needed)
 * - afterInteractive: Needed early (chat widgets)
 * - lazyOnload: Analytics, ads, tracking (recommended for most)
 */
export function ThirdPartyScripts({
    gaId,
    adsenseId,
    monetagId,
    crispId,
}: ThirdPartyScriptsProps) {
    return (
        <>
            {/* Google Analytics - lazyOnload for better performance */}
            {gaId && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                        strategy="lazyOnload"
                    />
                    <Script id="google-analytics" strategy="lazyOnload">
                        {`
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${gaId}', {
                                page_path: window.location.pathname,
                            });
                        `}
                    </Script>
                </>
            )}

            {/* Google AdSense - lazyOnload */}
            {adsenseId && (
                <Script
                    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
                    strategy="lazyOnload"
                    crossOrigin="anonymous"
                />
            )}

            {/* Monetag - lazyOnload */}
            {monetagId && (
                <Script
                    src={`https://alwingulla.com/88/${monetagId}/invoke.js`}
                    strategy="lazyOnload"
                />
            )}

            {/* Crisp Chat - afterInteractive (users might need support early) */}
            {crispId && (
                <Script id="crisp-chat" strategy="afterInteractive">
                    {`
                        window.$crisp=[];
                        window.CRISP_WEBSITE_ID="${crispId}";
                        (function(){
                            d=document;
                            s=d.createElement("script");
                            s.src="https://client.crisp.chat/l.js";
                            s.async=1;
                            d.getElementsByTagName("head")[0].appendChild(s);
                        })();
                    `}
                </Script>
            )}

            {/* Preconnect to external domains for faster loading */}
            <link rel="preconnect" href="https://www.google-analytics.com" />
            <link rel="preconnect" href="https://www.googletagmanager.com" />
            {adsenseId && (
                <>
                    <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
                    <link rel="preconnect" href="https://googleads.g.doubleclick.net" />
                </>
            )}
        </>
    );
}

/**
 * Usage in layout.tsx:
 * 
 * import { ThirdPartyScripts } from '@/components/ThirdPartyScripts';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <ThirdPartyScripts
 *           gaId={process.env.NEXT_PUBLIC_GA_ID}
 *           adsenseId={process.env.NEXT_PUBLIC_ADSENSE_ID}
 *           monetagId={process.env.NEXT_PUBLIC_MONETAG_ID}
 *         />
 *       </body>
 *     </html>
 *   );
 * }
 */
