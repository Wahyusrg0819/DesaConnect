"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Home, MessageSquarePlus, Search, Menu, X, FileSearch } from 'lucide-react';
import { useState, useEffect } from 'react';

// Daftar menu navigasi
const NAV_ITEMS = [
  {
    label: 'Beranda',
    href: '/',
    icon: Home,
    variant: 'ghost' as const,
    colorClass: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80',
  },
  {
    label: 'Buat Laporan',
    href: '/submit',
    icon: MessageSquarePlus,
    variant: 'default' as const,
    colorClass: 'bg-white text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white border-2 border-[#2E7D32] shadow-sm hover:shadow-md',
  },
  {
    label: 'Lacak Laporan',
    href: '/track',
    icon: FileSearch,
    variant: 'outline' as const,
    colorClass: 'bg-[#0D47A1] text-white hover:bg-[#0A3880] border-[#0D47A1]'
  },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tutup menu jika resize ke desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm" role="banner">
      <nav className="max-w-6xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center" aria-label="Main navigation">
        <Link href="/" className="text-2xl font-bold flex items-center gap-3 hover:opacity-90 transition-all" aria-label="Desa Pangkalan Baru Home">
          <div className="flex items-center justify-center" aria-hidden="true">
            <Image
              src="/images/300_kamparkab.webp"
              alt="Logo Kabupaten Kampar"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <span className="text-[#2E7D32] hover:text-[#1B5E20] transition-colors">
            Desa Pangkalan Baru
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {NAV_ITEMS.map((item) => (
            <Link href={item.href} passHref key={item.href}>
              <Button
                variant={item.variant === 'default' ? undefined : item.variant}
                className={`rounded-lg ${item.colorClass} transition-all`}
              >
                <item.icon className="mr-2 h-4 w-4" aria-hidden="true" /> 
                <span>{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Tutup Menu" : "Buka Menu"}
          style={{ minWidth: 48, minHeight: 48 }}
        >
          {mobileMenuOpen ? (
            <X className="h-7 w-7" aria-hidden="true" />
          ) : (
            <Menu className="h-7 w-7" aria-hidden="true" />
          )}
        </Button>
      </nav>

      {/* Mobile Navigation Dropdown & Backdrop */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
            aria-hidden="true"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Dropdown */}
          <div 
            className="fixed top-0 left-0 right-0 z-50 md:hidden bg-white border-b border-gray-100 py-4 px-6 space-y-3 shadow-lg animate-fade-in-scale"
            aria-label="Mobile navigation menu"
          >
            {NAV_ITEMS.map((item, idx) => (
              <div key={item.href}>
                <Link href={item.href} passHref onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={item.variant === 'default' ? undefined : item.variant}
                    className={`w-full justify-start rounded-lg ${item.colorClass} text-base py-3`}
                  >
                    <item.icon className="mr-2 h-5 w-5" aria-hidden="true" /> {item.label}
                  </Button>
                </Link>
                {idx < NAV_ITEMS.length - 1 && (
                  <div className="my-1 border-t border-gray-100" />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </header>
  );
}
