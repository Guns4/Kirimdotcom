'use client';

import Script from 'next/script';

/**
 * Third-party Scripts with Lazy Loading
 * Uses lazyOnload strategy to not block main render
 */

interface ScriptLoaderProps {
    gaId?: string;
    adsenseId?: string;
    monetagId?: string;
    fbPixelId?: string;
}

export function ThirdPartyScripts({
    gaId,
    adsenseId,
    monetagId,
    fbPixelId
}: ScriptLoaderProps) {
    return (
        <>
            {/* Google Analytics - lazyOnload */}
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
                    src={`https://alwingulla.com/88/tag.min.js`}
                    data-zone={monetagId}
                    strategy="lazyOnload"
                />
            )}

            {/* Facebook Pixel - lazyOnload */}
            {fbPixelId && (
                <Script id="facebook-pixel" strategy="lazyOnload">
                    {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${fbPixelId}');
            fbq('track', 'PageView');
          `}
                </Script>
            )}
        </>
    );
}

/**
 * Crisp Chat - afterInteractive (needed for support)
 */
export function CrispChat({ websiteId }: { websiteId: string }) {
    return (
        <Script id="crisp-chat" strategy="afterInteractive">
            {`
        window.$crisp=[];window.CRISP_WEBSITE_ID="${websiteId}";
        (function(){d=document;s=d.createElement("script");
        s.src="https://client.crisp.chat/l.js";s.async=1;
        d.getElementsByTagName("head")[0].appendChild(s);})();
      `}
        </Script>
    );
}

/**
 * Hotjar Analytics - lazyOnload
 */
export function HotjarAnalytics({ siteId }: { siteId: string }) {
    return (
        <Script id="hotjar" strategy="lazyOnload">
            {`
        (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:${siteId},hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `}
        </Script>
    );
}

export default ThirdPartyScripts;
