import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Area - DesaConnect',
  description: 'Area administratif DesaConnect',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        {/* Konten admin dengan padding yang cukup */}
        <div className="bg-white rounded-lg shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
} 