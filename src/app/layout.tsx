import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
            <body className="font-sans antialiased min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
                <Navbar />
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}
