import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { LiteModeProvider } from "@/context/LiteModeContext";
import { SystemStatusProvider } from "@/context/SystemStatusContext";
import { FeedbackWidget } from "@/components/ui/FeedbackWidget";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "CekKirim - Cek Ongkir & Lacak Resi Pengiriman",
    description: "Aplikasi untuk mengecek ongkos kirim dan melacak resi pengiriman dari berbagai ekspedisi di Indonesia",
    keywords: ["cek ongkir", "lacak resi", "pengiriman", "ekspedisi", "indonesia", "JNE", "J&T", "SiCepat"],
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/logo.png", type: "image/png" },
        ],
        apple: "/logo.png",
        shortcut: "/logo.png",
    },
    openGraph: {
        title: "CekKirim - Cek Ongkir & Lacak Resi",
        description: "Cek ongkir dan lacak resi semua kurir Indonesia",
        images: ["/og-image.png"],
        url: "https://www.cekkirim.com",
        siteName: "CekKirim",
        type: "website",
        locale: "id_ID",
    },
    twitter: {
        card: "summary_large_image",
        title: "CekKirim - Cek Ongkir & Lacak Resi",
        description: "Cek ongkir dan lacak resi semua kurir Indonesia",
        images: ["/og-image.png"],
    },
    manifest: "/manifest.json",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id" className={inter.variable}>
            <head>
                <Script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5099892029462046"
                    crossOrigin="anonymous"
                    strategy="afterInteractive"
                />
            </head>
            <body className="font-sans antialiased min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
                <SystemStatusProvider>
                    <LiteModeProvider>
                        <Navbar />
                        <main className="flex-1">
                            {children}
                        </main>
                        <FeedbackWidget />
                        <Footer />
                    </LiteModeProvider>
                </SystemStatusProvider>
            </body>
        </html>
    );
}
