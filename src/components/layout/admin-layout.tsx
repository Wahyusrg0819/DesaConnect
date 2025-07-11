'use client';

import { usePathname } from 'next/navigation';
import AdminHeader from './admin-header';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentUser?: { email?: string } | null;
}

export default function AdminLayout({ children, currentUser }: AdminLayoutProps) {
  const pathname = usePathname();
  
  // Pages where the admin header should NOT be shown
  const hideHeaderOnPages = ['/admin/login', '/admin/register'];
  const shouldShowHeader = !hideHeaderOnPages.includes(pathname);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {shouldShowHeader && <AdminHeader userEmail={currentUser?.email} />}
      
      <main className="flex-grow">
        {shouldShowHeader ? (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-white rounded-lg shadow-sm">
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