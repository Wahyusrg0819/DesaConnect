"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background text-foreground py-10 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <Link href="/" className="text-xl font-bold flex items-center gap-3">
              <div className="flex items-center justify-center p-1.5 rounded-md border border-border bg-card" aria-hidden="true">
                <Image
                  src="/images/300_kamparkab.webp"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight text-lg font-semibold">Desa Pangkalan Baru</span>
                <span className="text-xs text-muted-foreground">Pemerintah Kabupaten Kampar</span>
              </div>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm">
              Platform resmi layanan aspirasi dan pengaduan masyarakat Desa Pangkalan Baru. Wujudkan desa yang lebih baik, transparan, dan responsif.
            </p>
          </div>

          <nav aria-label="Footer navigation" className="md:col-span-3">
            <h3 className="font-semibold text-foreground mb-4 text-sm">Layanan</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary hover:underline transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/submit" className="hover:text-primary hover:underline transition-colors">
                  Buat Laporan Baru
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-primary hover:underline transition-colors">
                  Lacak Status Laporan
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-primary hover:underline transition-colors">
                  Portal Admin
                </Link>
              </li>
            </ul>
          </nav>

          <div className="md:col-span-4">
            <h3 className="font-semibold text-foreground mb-4 text-sm">Hubungi Kami</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span className="leading-relaxed">Kantor Kepala Desa Pangkalan Baru<br/>Kecamatan Siak Hulu, Kabupaten Kampar</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href="tel:+6282112345678" className="hover:text-primary hover:underline transition-colors">0821-1234-5678 (WhatsApp Support)</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href="mailto:pemdes@pangkalanbaru.desa.id" className="hover:text-primary hover:underline transition-colors">pemdes@pangkalanbaru.desa.id</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Pemerintah Desa Pangkalan Baru. Seluruh Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
