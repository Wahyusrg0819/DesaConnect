"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Settings, 
  FileText, 
  BarChart3, 
  User, 
  LogOut, 
  Menu, 
  X, 
  MessageSquarePlus 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { handleLogout } from "@/lib/actions/dashboard-actions";
import { usePathname } from 'next/navigation';

// Admin navigation items
const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Submissions',
    href: '/admin/dashboard/submissions',
    icon: FileText,
  },
  {
    label: 'Analytics',
    href: '/admin/dashboard/analytics',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    href: '/admin/dashboard/settings',
    icon: Settings,
  },
];

interface AdminHeaderProps {
  userEmail?: string;
}

export default function AdminHeader({ userEmail }: AdminHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center gap-2" aria-label="Admin Dashboard">
            <div className="bg-[#2E7D32] text-white p-1.5 rounded-md">
              <MessageSquarePlus className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">DesaConnect</span>
              <span className="text-xs text-gray-500 -mt-1">Admin Portal</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link href={item.href} key={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`rounded-md ${isActive ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <item.icon className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {userEmail && (
              <div className="hidden md:flex items-center gap-4">
                <div className="bg-primary/10 px-3 py-1 rounded-full flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-sm font-medium">{userEmail}</span>
                </div>
                <form action={handleLogout}>
                  <Button variant="outline" size="sm" type="submit" className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    <span className="hidden xs:inline">Logout</span>
                  </Button>
                </form>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-2 pb-3 space-y-1 bg-white border-b border-gray-200">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link 
                  href={item.href} 
                  key={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-start text-left rounded-md ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-gray-600'
                    }`}
                  >
                    <item.icon className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
            
            {userEmail && (
              <div className="pt-2 mt-2 border-t border-gray-200">
                <div className="flex items-center mb-3 px-2">
                  <User className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">{userEmail}</span>
                </div>
                <form action={handleLogout}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    type="submit" 
                    className="w-full justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 