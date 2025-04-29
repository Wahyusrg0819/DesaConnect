import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "DesaConnect - Sistem Layanan Aspirasi dan Keluhan Masyarakat",
  description: "Platform aspirasi dan keluhan masyarakat untuk membangun Desa Pangkalan Baru yang lebih baik dan lebih transparan.",
  keywords: "desa connect, aspirasi masyarakat, keluhan masyarakat, desa pangkalan baru, layanan publik, transparansi desa",
  authors: [{ name: "DesaConnect Team" }],
  creator: "DesaConnect Team",
  publisher: "DesaConnect",
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
    title: "DesaConnect - Sistem Layanan Aspirasi dan Keluhan Masyarakat",
    description: "Platform aspirasi dan keluhan masyarakat untuk membangun Desa Pangkalan Baru yang lebih baik dan lebih transparan.",
    type: "website",
    locale: "id_ID",
    url: "https://desaconnect.id",
    siteName: "DesaConnect",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "DesaConnect - Platform Aspirasi Masyarakat Desa",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DesaConnect - Sistem Layanan Aspirasi dan Keluhan Masyarakat",
    description: "Platform aspirasi dan keluhan masyarakat untuk membangun Desa Pangkalan Baru yang lebih baik.",
    images: ["/images/twitter-card.png"],
    creator: "@desaconnect",
    site: "@desaconnect",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
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