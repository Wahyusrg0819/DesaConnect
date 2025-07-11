import { ReactNode } from 'react';
import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth-utils';
import AdminLayout from '@/components/layout/admin-layout';

export const metadata: Metadata = {
  title: 'Admin Area - Desa Pangkalan Baru',
  description: 'Area administratif Desa Pangkalan Baru',
};

export default async function AdminRootLayout({ children }: { children: ReactNode }) {
  // Get current user data
  const currentUser = await getCurrentUser();
  
  return (
    <AdminLayout currentUser={currentUser}>
      {children}
    </AdminLayout>
  );
} 