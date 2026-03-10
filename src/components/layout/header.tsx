"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Home, MessageSquarePlus, Menu, X, FileSearch } from 'lucide-react';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  {
    label: 'Beranda',
    href: '/',
    icon: Home,
    variant: 'ghost' as const,
  },
  {
    label: 'Buat Laporan',
    href: '/submit',
    icon: MessageSquarePlus,
    variant: 'default' as const,
  },
  {
    label: 'Lacak Laporan',
    href: '/track',
    icon: FileSearch,
    variant: 'outline' as const,
  },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <nav className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-3" aria-label="Desa Pangkalan Baru Home">
          <div className="flex items-center justify-center p-1 border border-border rounded-md bg-card" aria-hidden="true">
            <Image
              src="/images/300_kamparkab.webp"
              alt="Logo Kabupaten Kampar"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold leading-tight text-foreground">
              Desa Pangkalan Baru
            </span>
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">
              Layanan Aspirasi
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {NAV_ITEMS.map((item) => (
            <Link href={item.href} passHref key={item.href}>
              <Button variant={item.variant} size="sm">
                <item.icon className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <Button 
          variant="outline" 
          size="icon" 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Tutup Menu" : "Buka Menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </Button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-2">
          {NAV_ITEMS.map((item) => (
            <Link href={item.href} passHref key={item.href} onClick={() => setMobileMenuOpen(false)}>
              <Button variant={item.variant} className="w-full justify-start">
                <item.icon className="mr-2 h-4 w-4" aria-hidden="true" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
