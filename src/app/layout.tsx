import type {Metadata} from 'next';
import { Roboto } from 'next/font/google'; // Import Roboto
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

// Configure Roboto font
const roboto = Roboto({
  weight: ['400', '700'], // Include weights needed
  subsets: ['latin'],
  variable: '--font-roboto', // Define CSS variable
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DesaConnect - Aspirasi & Keluhan Desa Pangkalan Baru',
  description: 'Sistem Layanan Aspirasi dan Keluhan Masyarakat Berbasis Website Desa Pangkalan Baru',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable}`}>
      <body className="antialiased font-sans bg-secondary">
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
          <Toaster />
        </div>
      </body>
    </html>
  );
}
