import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/services/auth";
import { QueryProvider } from "@/services/queryClient";
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Rehoboth Christian Church",
  description: "Join us for worship and fellowship at Rehoboth Christian Church",
  keywords: "church, christian, worship, sermon, faith",
  authors: [{ name: "Rehoboth Christian Church" }],
  creator: "Rehoboth Christian Church",
  publisher: "Rehoboth Christian Church",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://rehobothnewwebsite-h8fe3klga-rehoboth-churchs-projects.vercel.app'),
  openGraph: {
    title: "Rehoboth Christian Church",
    description: "Join us for worship and fellowship at Rehoboth Christian Church",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://rehobothnewwebsite-h8fe3klga-rehoboth-churchs-projects.vercel.app',
    siteName: "Rehoboth Christian Church",
    images: [
      {
        url: '/rehoboth_logo_plain.png',
        width: 80,
        height: 80,
        alt: 'Rehoboth Christian Church Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "Rehoboth Christian Church",
    description: "Join us for worship and fellowship at Rehoboth Christian Church",
    images: ['/rehoboth_logo_plain.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/rehoboth_logo_plain.png', sizes: '80x80', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '80x80', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1f2937" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Rehoboth Church" />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || 'https://rehobothnewwebsite-h8fe3klga-rehoboth-churchs-projects.vercel.app'} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <div className="flex flex-col min-h-[100dvh] supports-[height:100vh]:min-h-screen">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
