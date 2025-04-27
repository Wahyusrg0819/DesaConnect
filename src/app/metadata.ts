import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "DesaConnect - Sistem Layanan Aspirasi dan Keluhan Masyarakat",
  description: "Platform aspirasi dan keluhan masyarakat untuk Desa Pangkalan Baru",
  keywords: "desa connect, aspirasi masyarakat, keluhan masyarakat, desa pangkalan baru",
  authors: [{ name: "DesaConnect Team" }],
  openGraph: {
    title: "DesaConnect - Sistem Layanan Aspirasi dan Keluhan Masyarakat",
    description: "Platform aspirasi dan keluhan masyarakat untuk Desa Pangkalan Baru",
    type: "website",
    locale: "id_ID",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#2E7D32',
}; 