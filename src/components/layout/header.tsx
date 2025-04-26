"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, MessageSquarePlus, Search, Menu, X, FileSearch } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-[#F0F0F0] sticky top-0 z-50 shadow-sm">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="bg-[#4CAF50] text-white p-1 rounded-md">
            <MessageSquarePlus className="h-6 w-6" />
          </div>
          <span className="text-[#4CAF50]">
            DesaConnect
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/" passHref>
            <Button variant="ghost" className="rounded-lg hover:bg-[#F0F0F0] transition-colors">
              <Home className="mr-2 h-4 w-4" /> Beranda
            </Button>
          </Link>
          <Link href="/submit" passHref>
            <Button className="rounded-lg bg-[#2196F3] hover:bg-[#2196F3]/90 text-white transition-colors">
              <MessageSquarePlus className="mr-2 h-4 w-4" /> Buat Laporan
            </Button>
          </Link>
          <Link href="/track" passHref>
            <Button variant="outline" className="rounded-lg border-[#F0F0F0] hover:bg-[#F0F0F0] transition-colors">
              <FileSearch className="mr-2 h-4 w-4" /> Lacak Laporan
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </nav>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#F0F0F0] py-3 px-4 space-y-2 shadow-lg animate-in slide-in-from-top-5">
          <Link href="/" passHref onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              <Home className="mr-2 h-5 w-5" /> Beranda
            </Button>
          </Link>
          <Link href="/submit" passHref onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start bg-[#2196F3]/10 text-[#2196F3]">
              <MessageSquarePlus className="mr-2 h-5 w-5" /> Buat Laporan
            </Button>
          </Link>
          <Link href="/track" passHref onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              <FileSearch className="mr-2 h-5 w-5" /> Lacak Laporan
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
