'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { X, ShieldCheck } from 'lucide-react';

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

export default function ClarityAnalytics() {
    // State for consent
    const [consent, setConsent] = useState<boolean | null>(null);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check local storage for existing consent
        const savedConsent = localStorage.getItem('clarity-consent');

        if (savedConsent === 'true') {
            setConsent(true);
        } else if (savedConsent === 'false') {
            setConsent(false);
        } else {
            // No consent found, show banner
            setShowBanner(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('clarity-consent', 'true');
        setConsent(true);
        setShowBanner(false);
    };

    const handleDecline = () => {
        localStorage.setItem('clarity-consent', 'false');
        setConsent(false);
        setShowBanner(false);
    };

    // If no project ID is configured, don't run anything (except maybe in dev log)
    if (!CLARITY_PROJECT_ID) {
        if (process.env.NODE_ENV === 'development' && !consent) {
            console.warn('Clarity Project ID missing. Define NEXT_PUBLIC_CLARITY_PROJECT_ID in .env');
        }
    }

    return (
        <>
            {/* Inject Clarity Script only if consent is true and ID exists */}
            {consent && CLARITY_PROJECT_ID && (
                <Script
                    id="microsoft-clarity-init"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function(c,l,a,r,i,t,y){
                                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                            })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
                            
                            // Privacy Config: Mask all inputs by default
                            window.clarity('mask', 'input, textarea, select, .sensitive-data');
                        `
                    }}
                />
            )}

            {/* Consent Banner */}
            {showBanner && (
                <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom duration-500">
                    <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-xl p-6 relative">
                        <button
                            onClick={() => setShowBanner(false)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Analitik & Privasi</h3>
                                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                    Kami merekam interaksi anonim untuk meningkatkan pengalaman Anda. Data sensitif diblur otomatis.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleAccept}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shadow-sm hover:shadow"
                                    >
                                        Izinkan
                                    </button>
                                    <button
                                        onClick={handleDecline}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                                    >
                                        Tolak
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
