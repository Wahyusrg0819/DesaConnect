"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-sidebar-background text-sidebar-foreground py-12 border-t border-border relative overflow-hidden">
      {/* Decorative top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/10 via-primary to-primary/10"></div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <Link href="/" className="text-xl font-bold flex items-center gap-3">
              <div className="flex items-center justify-center p-1.5 rounded-lg bg-primary/10 shadow-sm" aria-hidden="true">
                <Image
                  src="/images/300_kamparkab.webp"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-primary leading-tight text-lg">Desa Pangkalan Baru</span>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Pemerintah Kabupaten Kampar</span>
              </div>
            </Link>
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed max-w-sm">
              Platform resmi layanan aspirasi dan pengaduan masyarakat Desa Pangkalan Baru. Wujudkan desa yang lebih baik, transparan, dan responsif.
            </p>
          </div>

          <nav aria-label="Footer navigation" className="md:col-span-3">
            <h3 className="font-bold text-foreground mb-4 uppercase tracking-wider text-sm">Layanan</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition-colors flex items-center gap-2 group">
                  <ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary" />
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/submit" className="hover:text-primary transition-colors flex items-center gap-2 group">
                  <ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary" />
                  Buat Laporan Baru
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-primary transition-colors flex items-center gap-2 group">
                  <ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary" />
                  Lacak Status Laporan
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-primary transition-colors flex items-center gap-2 group">
                  <ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary" />
                  Portal Admin
                </Link>
              </li>
            </ul>
          </nav>

          <div className="md:col-span-4">
            <h3 className="font-bold text-foreground mb-4 uppercase tracking-wider text-sm">Hubungi Kami</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-secondary text-foreground mt-0.5">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="leading-relaxed">Kantor Kepala Desa Pangkalan Baru<br/>Kecamatan Siak Hulu, Kabupaten Kampar</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-secondary text-foreground">
                  <Phone className="h-4 w-4" />
                </div>
                <a href="tel:+6282112345678" className="hover:text-primary transition-colors font-medium">0821-1234-5678 (WhatsApp Support)</a>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-secondary text-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <a href="mailto:pemdes@pangkalanbaru.desa.id" className="hover:text-primary transition-colors font-medium">pemdes@pangkalanbaru.desa.id</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/60 text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Pemerintah Desa Pangkalan Baru. Seluruh Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
