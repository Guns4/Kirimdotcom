import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { LiteModeProvider } from "@/context/LiteModeContext";
import { SystemStatusProvider } from "@/context/SystemStatusContext";
import { FeedbackWidget } from "@/components/ui/FeedbackWidget";
import { siteConfig } from "@/config/site";
import { headers } from "next/headers";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/logo.png", type: "image/png" },
        ],
        apple: "/logo.png",
        shortcut: "/logo.png",
    },
    openGraph: {
        title: {
            default: siteConfig.name,
            template: `%s | ${siteConfig.name}`,
        },
        description: siteConfig.description,
        images: [siteConfig.ogImage],
        url: siteConfig.url,
        siteName: siteConfig.name,
        type: "website",
        locale: "id_ID",
    },
    twitter: {
        card: "summary_large_image",
        title: {
            default: siteConfig.name,
            template: `%s | ${siteConfig.name}`,
        },
        description: siteConfig.description,
        images: [siteConfig.ogImage],
    },
    manifest: "/manifest.json",
    verification: {
        google: "google-site-verification=YOUR_VERIFICATION_CODE", // Ganti dengan kode dari Google Search Console
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "";
    const isWidget = pathname.startsWith("/widget");

    return (
        <html lang="id" className={inter.variable}>
            <head>
                <Script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5099892029462046"
                    crossOrigin="anonymous"
                    strategy="lazyOnload"
                />
            </head>
            <body className={`font-sans antialiased min-h-screen flex flex-col ${isWidget ? 'bg-transparent' : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30'}`}>
                <SystemStatusProvider>
                    <LiteModeProvider>
                        {!isWidget && <Navbar />}
                        <main className={isWidget ? "min-h-screen flex items-center justify-center p-4" : "flex-1 pb-16 md:pb-0"}>
                            {children}
                        </main>
                        {!isWidget && <FeedbackWidget />}
                        {!isWidget && <Footer />}
                        {!isWidget && <BottomNav />}
                    </LiteModeProvider>
                </SystemStatusProvider>
            </body>
        </html>
    );
}
