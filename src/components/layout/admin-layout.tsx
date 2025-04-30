import AdminHeader from './admin-header';
import { User } from '@/lib/types';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentUser?: User | null;
}

export default function AdminLayout({ children, currentUser }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader userEmail={currentUser?.email} />
      
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
} 