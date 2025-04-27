"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, MessageSquarePlus, Search, Menu, X, FileSearch } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm" role="banner">
      <nav className="max-w-6xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center" role="navigation" aria-label="Main navigation">
        <Link href="/" className="text-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-all" aria-label="DesaConnect Home">
          <div className="bg-[#4CAF50] text-white p-1.5 rounded-xl" aria-hidden="true">
            <MessageSquarePlus className="h-6 w-6" />
          </div>
          <span className="text-[#2E7D32] hover:text-[#4CAF50] transition-colors">
            DesaConnect
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4" role="menubar">
          <Link href="/" passHref>
            <Button variant="ghost" className="rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-all" aria-label="Ke Beranda">
              <Home className="mr-2 h-4 w-4" aria-hidden="true" /> Beranda
            </Button>
          </Link>
          <Link href="/submit" passHref>
            <Button className="rounded-lg bg-white text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white border-2 border-[#4CAF50] shadow-sm hover:shadow-md transition-all" aria-label="Buat Laporan Baru">
              <MessageSquarePlus className="mr-2 h-4 w-4" aria-hidden="true" /> Buat Laporan
            </Button>
          </Link>
          <Link href="/track" passHref>
            <Button variant="outline" className="rounded-lg bg-[#2196F3] text-white hover:bg-[#1976D2] border-[#2196F3] transition-all" aria-label="Lacak Status Laporan">
              <FileSearch className="mr-2 h-4 w-4" aria-hidden="true" /> Lacak Laporan
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100/80" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Tutup Menu" : "Buka Menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </Button>
      </nav>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden bg-white border-t border-gray-100 py-4 px-6 space-y-3 shadow-lg animate-in slide-in-from-top-5"
          role="menu"
          aria-label="Mobile navigation menu"
        >
          <Link href="/" passHref onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100/80" role="menuitem">
              <Home className="mr-2 h-5 w-5" aria-hidden="true" /> Beranda
            </Button>
          </Link>
          <Link href="/submit" passHref onClick={() => setMobileMenuOpen(false)}>
            <Button className="w-full justify-start rounded-lg bg-white text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white border-2 border-[#4CAF50]" role="menuitem">
              <MessageSquarePlus className="mr-2 h-5 w-5" aria-hidden="true" /> Buat Laporan
            </Button>
          </Link>
          <Link href="/track" passHref onClick={() => setMobileMenuOpen(false)}>
            <Button variant="outline" className="w-full justify-start rounded-lg bg-[#2196F3] text-white hover:bg-[#1976D2] border-[#2196F3]" role="menuitem">
              <FileSearch className="mr-2 h-5 w-5" aria-hidden="true" /> Lacak Laporan
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
