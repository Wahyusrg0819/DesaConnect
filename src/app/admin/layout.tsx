import { ReactNode } from 'react';
import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth-utils';
import AdminLayout from '@/components/layout/admin-layout';

export const metadata: Metadata = {
  title: 'Admin Area - DesaConnect',
  description: 'Area administratif DesaConnect',
};

export default async function AdminRootLayout({ children }: { children: ReactNode }) {
  // Get current user data
  const currentUser = await getCurrentUser();
  
  return (
    <AdminLayout currentUser={currentUser}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        {/* Konten admin dengan padding yang cukup */}
        <div className="bg-white rounded-lg shadow-sm">
          {children}
        </div>
      </div>
    </AdminLayout>
  );
} 