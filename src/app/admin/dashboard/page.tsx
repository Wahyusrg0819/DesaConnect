import { Metadata } from "next";
import { protectAdminRoute, getCurrentUser } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { handleLogout } from "@/lib/actions/dashboard-actions";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Dashboard - DesaConnect",
  description: "Dashboard admin DesaConnect",
};

export default async function AdminDashboardPage() {
  // Proteksi halaman admin (redirect jika bukan admin)
  await protectAdminRoute();
  
  // Dapatkan data user saat ini
  const user = await getCurrentUser();
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
          <p className="text-muted-foreground">
            Selamat datang, {user?.email}
          </p>
        </div>
        <form action={handleLogout}>
          <Button variant="outline" type="submit">Logout</Button>
        </form>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/dashboard/submissions" className="group">
          <div className="rounded-lg border p-6 shadow-sm transition-all hover:shadow-md group-hover:border-primary">
            <h3 className="text-xl font-semibold">Kelola Laporan</h3>
            <p className="text-sm text-muted-foreground">
              Lihat dan kelola seluruh laporan dari masyarakat
            </p>
          </div>
        </Link>
        
        <Link href="/admin/dashboard/analytics" className="group">
          <div className="rounded-lg border p-6 shadow-sm transition-all hover:shadow-md group-hover:border-primary">
            <h3 className="text-xl font-semibold">Analitik</h3>
            <p className="text-sm text-muted-foreground">
              Lihat statistik dan analisis data laporan
            </p>
          </div>
        </Link>
        
        <Link href="/admin/dashboard/settings" className="group">
          <div className="rounded-lg border p-6 shadow-sm transition-all hover:shadow-md group-hover:border-primary">
            <h3 className="text-xl font-semibold">Pengaturan</h3>
            <p className="text-sm text-muted-foreground">
              Konfigurasi dan pengaturan sistem
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
} 