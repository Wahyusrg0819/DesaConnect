import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://desa-connect.vercel.app' : 'http://localhost:3000'),
  title: "Desa Pangkalan Baru - Sistem Layanan Aspirasi dan Keluhan Masyarakat",
  description: "Platform aspirasi dan keluhan masyarakat untuk membangun Desa Pangkalan Baru yang lebih baik dan lebih transparan.",
  keywords: "desa connect, aspirasi masyarakat, keluhan masyarakat, desa pangkalan baru, layanan publik, transparansi desa",
  authors: [{ name: "Desa Pangkalan Baru Team" }],
  creator: "Desa Pangkalan Baru Team",
  publisher: "Desa Pangkalan Baru",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: "Desa Pangkalan Baru - Sistem Layanan Aspirasi dan Keluhan Masyarakat",
    description: "Platform aspirasi dan keluhan masyarakat untuk membangun Desa Pangkalan Baru yang lebih baik dan lebih transparan.",
    type: "website",
    locale: "id_ID",
    url: "https://desaconnect.id",
    siteName: "Desa Pangkalan Baru",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Desa Pangkalan Baru - Platform Aspirasi Masyarakat Desa",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Desa Pangkalan Baru - Sistem Layanan Aspirasi dan Keluhan Masyarakat",
    description: "Platform aspirasi dan keluhan masyarakat untuk membangun Desa Pangkalan Baru yang lebih baik.",
    images: ["/images/twitter-card.png"],
    creator: "@desaconnect",
    site: "@desaconnect",
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=2", type: "image/x-icon" },
      { url: "/images/300_kamparkab.webp?v=2", type: "image/webp" },
    ],
    apple: [
      { url: "/images/300_kamparkab.webp?v=2", sizes: "180x180", type: "image/webp" },
    ],
    other: [
      { url: "/images/300_kamparkab.webp?v=2", sizes: "192x192", type: "image/webp" },
      { url: "/images/300_kamparkab.webp?v=2", sizes: "512x512", type: "image/webp" },
    ],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://desaconnect.id",
  },
  category: "government",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#2E7D32',
}; 