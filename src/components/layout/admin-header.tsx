"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Settings,
  FileText,
  BarChart3,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { handleLogout } from "@/lib/actions/dashboard-actions";
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Submissions', href: '/admin/dashboard/submissions', icon: FileText },
  { label: 'Analytics', href: '/admin/dashboard/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/dashboard/settings', icon: Settings },
];

interface AdminHeaderProps {
  userEmail?: string;
}

export default function AdminHeader({ userEmail }: AdminHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Image
              src="/images/300_kamparkab.webp"
              alt="Logo"
              width={28}
              height={28}
              className="object-contain"
              priority
            />
            <span className="text-base font-semibold">Admin</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  size="sm"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm">
                Lihat Situs
              </Button>
            </Link>
            <form action={async () => { await handleLogout(new FormData()); }}>
              <Button variant="ghost" size="sm" type="submit">
                Keluar
              </Button>
            </form>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border px-4 py-3 space-y-1 bg-card">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className="w-full justify-start"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
