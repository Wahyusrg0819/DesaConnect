"use client";

import Link from "next/link";
import { MessageSquarePlus, Mail, Phone, MapPin, FacebookIcon, InstagramIcon, TwitterIcon, Lock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="bg-[#F0F0F0] text-gray-700 py-12 border-t border-[#E0E0E0]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="text-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="bg-[#4CAF50] text-white p-1 rounded-md">
                <MessageSquarePlus className="h-5 w-5" />
              </div>
              <span className="text-[#4CAF50]">DesaConnect</span>
            </Link>
            <p className="text-sm">
              Platform aspirasi dan keluhan untuk Desa Pangkalan Baru. Sampaikan suara Anda dan bantu kami membangun desa yang lebih baik.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-gray-800">Navigasi</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-[#4CAF50] transition-colors">Beranda</Link>
              </li>
              <li>
                <Link href="/submit" className="text-sm hover:text-[#4CAF50] transition-colors">Buat Laporan</Link>
              </li>
              <li>
                <Link href="/track" className="text-sm hover:text-[#4CAF50] transition-colors">Lacak Laporan</Link>
              </li>
              <li>
                <Link href="/about" className="text-sm hover:text-[#4CAF50] transition-colors">Tentang Kami</Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-sm hover:text-[#4CAF50] transition-colors flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Admin
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-gray-800">Kontak</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-[#4CAF50]" />
                <span>Jl. Desa No. 123, Pangkalan Baru</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-[#4CAF50]" />
                <a href="tel:+6282112345678" className="hover:text-[#4CAF50] transition-colors">+62 821-1234-5678</a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-[#4CAF50]" />
                <a href="mailto:info@desaconnect.id" className="hover:text-[#4CAF50] transition-colors">info@desaconnect.id</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-gray-800">Media Sosial</h3>
            <div className="flex items-center gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#2196F3] transition-colors">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#2196F3] transition-colors">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#2196F3] transition-colors">
                <TwitterIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <Separator className="my-6 bg-[#E0E0E0]" />
        
        <div className="flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© {new Date().getFullYear()} Desa Pangkalan Baru. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-[#2196F3] transition-colors">Kebijakan Privasi</Link>
            <Link href="/terms" className="hover:text-[#2196F3] transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
