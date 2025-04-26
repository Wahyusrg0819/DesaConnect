import { ReactNode } from 'react';

export const metadata = {
  title: 'Admin Area - DesaConnect',
  description: 'Area administratif DesaConnect',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Konten admin */}
      <div className="flex-grow">{children}</div>
    </div>
  );
} 