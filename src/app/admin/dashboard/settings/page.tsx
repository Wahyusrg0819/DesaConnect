import { Metadata } from "next";
import { protectAdminRoute, getCurrentUser } from "@/lib/auth-utils";
import AdminSettings from "@/components/admin/settings";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Admin Settings - Desa Pangkalan Baru",
  description: "Pengaturan administrator Desa Pangkalan Baru",
};

export default async function AdminSettingsPage() {
  // Proteksi halaman admin (redirect jika bukan admin)
  await protectAdminRoute();
  
  // Dapatkan data user saat ini
  const user = await getCurrentUser();
  
  return (
    <div className="container max-w-6xl px-4 py-6 md:py-8 mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            <span>Kembali</span>
          </Button>
        </Link>
      </div>
      
      <div className="mb-8 space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pengaturan Admin</h1>
        <p className="text-muted-foreground">
          Kelola pengaturan aplikasi dan daftar admin
        </p>
      </div>
      
      <Suspense fallback={<div className="flex items-center justify-center p-12 border rounded-md bg-muted/5"><div className="flex flex-col items-center"><div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin mb-3"></div><p className="text-muted-foreground text-sm">Memuat pengaturan...</p></div></div>}>
        <AdminSettings currentUser={user as any} />
      </Suspense>
    </div>
  );
} 