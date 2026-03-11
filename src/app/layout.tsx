import { Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import SupabaseProvider from '@/components/providers/supabase-provider';
import ServiceWorkerProvider from '@/components/providers/service-worker-provider';
import ThemeProvider from '@/components/providers/theme-provider';
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
  const themeScript = `(() => {
    try {
      const theme = localStorage.getItem('desaconnect-theme');
      const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    } catch {
      document.documentElement.classList.remove('dark');
    }
  })();`;

  return (
    <html lang="id" className={roboto.className} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/300_kamparkab.webp?v=2" />
        <link rel="icon" href="/favicon.ico?v=2" type="image/x-icon" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <ThemeProvider>
          <SupabaseProvider>
            <ServiceWorkerProvider />
            <div className="flex flex-col flex-grow">
              {children}
              <Toaster />
            </div>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
