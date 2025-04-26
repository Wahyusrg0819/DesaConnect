import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import SupabaseProvider from '@/components/providers/supabase-provider';

// Configure Roboto font
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "DesaConnect - Sistem Layanan Aspirasi dan Keluhan Masyarakat",
  description: "Platform aspirasi dan keluhan masyarakat untuk Desa Pangkalan Baru",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={roboto.className}>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <SupabaseProvider>
          <div className="flex flex-col flex-grow">
            <Header />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
              <Toaster />
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
}
