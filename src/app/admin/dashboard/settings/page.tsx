import { Metadata } from "next";
import { protectAdminRoute, getCurrentUser } from "@/lib/auth-utils";
import AdminSettings from "@/components/admin/settings";

export const metadata: Metadata = {
  title: "Admin Settings - DesaConnect",
  description: "Pengaturan administrator DesaConnect",
};

export default async function AdminSettingsPage() {
  // Proteksi halaman admin (redirect jika bukan admin)
  await protectAdminRoute();
  
  // Dapatkan data user saat ini
  const user = await getCurrentUser();
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan Admin</h1>
        <p className="text-muted-foreground">
          Kelola pengaturan aplikasi dan daftar admin
        </p>
      </div>
      
      <AdminSettings currentUser={user} />
    </div>
  );
} 