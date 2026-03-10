'use client';

import { usePathname } from 'next/navigation';
import AdminHeader from './admin-header';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentUser?: { email?: string } | null;
}

export default function AdminLayout({ children, currentUser }: AdminLayoutProps) {
  const pathname = usePathname();

  const hideHeaderOnPages = ['/admin/login', '/admin/register'];
  const shouldShowHeader = !hideHeaderOnPages.includes(pathname);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {shouldShowHeader && <AdminHeader userEmail={currentUser?.email} />}

      <main className="flex-grow">
        {shouldShowHeader ? (
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="bg-card border rounded-sm">
              {children}
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
} 