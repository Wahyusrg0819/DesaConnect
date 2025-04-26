import { Metadata } from "next";
import LoginForm from "@/components/admin/login-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Login - DesaConnect",
  description: "Login untuk akses dashboard admin DesaConnect",
};

export default function AdminLoginPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center">
          <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
} 