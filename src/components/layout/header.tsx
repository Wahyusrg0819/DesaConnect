"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, MessageSquarePlus, Search, Menu, X, FileSearch } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-[#F0F0F0] sticky top-0 z-50 shadow-sm" role="banner">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center" role="navigation" aria-label="Main navigation">
        <Link href="/" className="text-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity" aria-label="DesaConnect Home">
          <div className="bg-[#2E7D32] text-white p-1 rounded-md" aria-hidden="true">
            <MessageSquarePlus className="h-6 w-6" />
          </div>
          <span className="text-[#2E7D32]">
            DesaConnect
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3" role="menubar">
          <Link href="/" passHref>
            <Button variant="ghost" className="rounded-lg hover:bg-[#F0F0F0] transition-colors" aria-label="Ke Beranda">
              <Home className="mr-2 h-4 w-4" aria-hidden="true" /> Beranda
            </Button>
          </Link>
          <Link href="/submit" passHref>
            <Button className="rounded-lg bg-[#1565C0] hover:bg-[#1565C0]/90 text-white transition-colors" aria-label="Buat Laporan Baru">
              <MessageSquarePlus className="mr-2 h-4 w-4" aria-hidden="true" /> Buat Laporan
            </Button>
          </Link>
          <Link href="/track" passHref>
            <Button variant="outline" className="rounded-lg border-[#F0F0F0] hover:bg-[#F0F0F0] transition-colors" aria-label="Lacak Status Laporan">
              <FileSearch className="mr-2 h-4 w-4" aria-hidden="true" /> Lacak Laporan
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
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
          className="md:hidden bg-white border-t border-[#F0F0F0] py-3 px-4 space-y-2 shadow-lg animate-in slide-in-from-top-5"
          role="menu"
          aria-label="Mobile navigation menu"
        >
          <Link href="/" passHref onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start" role="menuitem">
              <Home className="mr-2 h-5 w-5" aria-hidden="true" /> Beranda
            </Button>
          </Link>
          <Link href="/submit" passHref onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start bg-[#1565C0]/10 text-[#1565C0]" role="menuitem">
              <MessageSquarePlus className="mr-2 h-5 w-5" aria-hidden="true" /> Buat Laporan
            </Button>
          </Link>
          <Link href="/track" passHref onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start" role="menuitem">
              <FileSearch className="mr-2 h-5 w-5" aria-hidden="true" /> Lacak Laporan
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
