"use client";

import Link from "next/link";
import { MessageSquarePlus, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground py-8 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="text-base font-semibold flex items-center gap-2">
              <MessageSquarePlus className="h-5 w-5 text-primary" />
              <span>Desa Pangkalan Baru</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Platform aspirasi dan keluhan masyarakat Desa Pangkalan Baru.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h3 className="font-medium mb-3">Navigasi</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:underline">Beranda</Link></li>
              <li><Link href="/submit" className="hover:underline">Buat Laporan</Link></li>
              <li><Link href="/track" className="hover:underline">Lacak Laporan</Link></li>
              <li><Link href="/admin/login" className="hover:underline">Admin</Link></li>
            </ul>
          </nav>

          <div>
            <h3 className="font-medium mb-3">Kontak</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Jl. Desa No. 123, Pangkalan Baru</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+6282112345678" className="hover:underline">+62 821-1234-5678</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:info@desaconnect.id" className="hover:underline">info@desaconnect.id</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-border text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Desa Pangkalan Baru. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
