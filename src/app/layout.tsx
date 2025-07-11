import { Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import SupabaseProvider from '@/components/providers/supabase-provider';
import ServiceWorkerProvider from '@/components/providers/service-worker-provider';
import { metadata, viewport } from './metadata';

// Configure Roboto font
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export { metadata, viewport };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={roboto.className}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2E7D32" />
        <link rel="apple-touch-icon" href="/images/300_kamparkab.webp" />
        {/* Add additional icon sizes for apple devices */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <SupabaseProvider>
          <ServiceWorkerProvider />
          <div className="flex flex-col flex-grow">
            {/* Conditionally render Header and Footer if NOT in admin section */}
            {children}
            <Toaster />
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
}
