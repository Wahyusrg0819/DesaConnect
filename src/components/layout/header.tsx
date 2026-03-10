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
    <header className="glass sticky top-0 z-50 transition-all duration-300">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center" aria-label="Main navigation">
        <Link href="/" className="text-xl font-bold flex items-center gap-3 group" aria-label="Desa Pangkalan Baru Home">
          <div className="flex items-center justify-center p-1.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors shadow-sm" aria-hidden="true">
            <Image
              src="/images/300_kamparkab.webp"
              alt="Logo Kabupaten Kampar"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-primary font-bold tracking-tight">
              Desa Pangkalan Baru
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
              Layanan Aspirasi
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3 bg-white/50 px-2 py-1.5 rounded-full border border-border shadow-sm">
          {NAV_ITEMS.map((item) => (
            <Link href={item.href} passHref key={item.href}>
              <Button variant={item.variant === 'default' ? 'default' : 'ghost'} size="sm" className={item.variant !== 'default' ? 'rounded-full hover:bg-primary/10' : 'rounded-full shadow-md hover:shadow-lg transition-all'}>
                <item.icon className="mr-2 h-4 w-4" aria-hidden="true" />
                <span className="font-medium">{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <Button 
          variant="outline" 
          size="icon" 
          className="md:hidden rounded-lg bg-white/80 border-border shadow-sm"
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
        <div className="md:hidden border-t border-border bg-white px-4 py-3 space-y-2">
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
