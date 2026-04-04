
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { ClientProviders } from './client-providers';
import WinnerMarquee from '@/components/WinnerMarquee';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'My Abacus Pro | Master Mental Math & Soroban Online',
    template: '%s | My Abacus Pro',
  },
  description: 'The ultimate training ground for mental math. Practice Soroban abacus formulas, take timed tests, and climb the global leaderboard. Perfect for students and teachers.',
  keywords: ['Abacus', 'Mental Math', 'Soroban', 'Math Practice', 'Timed Math Tests', 'Japanese Abacus', 'Anzan', 'Math for Kids'],
  authors: [{ name: 'My Abacus Pro Team' }],
  creator: 'My Abacus Pro',
  publisher: 'My Abacus Pro',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://myabacuspro.com'),
  alternates: {
    canonical: 'https://myabacuspro.com',
  },
  openGraph: {
    title: 'My Abacus Pro | Master Mental Math & Soroban Online',
    description: 'Boost your calculation speed with timed challenges and Soroban abacus mastery training.',
    url: 'https://myabacuspro.com',
    siteName: 'My Abacus Pro',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Abacus Pro | Master Mental Math & Soroban Online',
    description: 'Timed math challenges and Soroban abacus mastery training.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="font-body antialiased h-full">
        <ClientProviders>
          <WinnerMarquee />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main id="main-content" className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-card/95 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg border">
                {children}
              </div>
            </main>
            <Footer />
          </div>
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
