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
    keywords: ["cek ongkir", "lacak resi", "pengiriman", "ekspedisi", "indonesia"],
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
