"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, PlusCircle, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";

interface AdminSettingsProps {
  currentUser?: User | null;
}

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function AdminSettings({ currentUser }: AdminSettingsProps) {
  const [adminList, setAdminList] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch daftar admin saat komponen dimuat
  useEffect(() => {
    fetchAdminList();
  }, []);

  // Fungsi untuk mengambil daftar admin dari database
  const fetchAdminList = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('admin_list')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setAdminList(data || []);
    } catch (error: any) {
      console.error("Error fetching admin list:", error);
      setError(error.message || "Error mengambil daftar admin");
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk menambah admin baru
  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const emailToAdd = newAdminEmail.trim().toLowerCase();

    try {
      // Validasi email dengan regex
      if (!EMAIL_REGEX.test(emailToAdd)) {
        throw new Error("Format email tidak valid");
      }

      // Cek apakah email sudah ada dalam daftar
      const exists = adminList.some(
        (admin) => admin.email.toLowerCase() === emailToAdd
      );

      if (exists) {
        throw new Error("Email sudah terdaftar sebagai admin");
      }

      // Tambahkan ke database
      const { error } = await supabase
        .from('admin_list')
        .insert({ email: emailToAdd });

      if (error) {
        if (error.code === '23505') { // PostgreSQL unique constraint violation
          throw new Error("Email sudah terdaftar sebagai admin");
        }
        throw error;
      }

      // Reset form dan refresh daftar
      setNewAdminEmail("");
      setSuccess("Admin berhasil ditambahkan");
      fetchAdminList();
    } catch (error: any) {
      console.error("Error adding admin:", error);
      setError(error.message || "Error menambahkan admin");
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk menghapus admin
  const removeAdmin = async (email: string) => {
    if (!confirm(`Yakin ingin menghapus admin dengan email ${email}?`)) {
      return;
    }

    // Tidak boleh menghapus diri sendiri
    if (currentUser?.email?.toLowerCase() === email.toLowerCase()) {
      setError("Anda tidak dapat menghapus diri sendiri dari daftar admin");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('admin_list')
        .delete()
        .eq('email', email);

      if (error) {
        throw error;
      }

      setSuccess("Admin berhasil dihapus");
      fetchAdminList();
    } catch (error: any) {
      console.error("Error removing admin:", error);
      setError(error.message || "Error menghapus admin");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="admins">
      <TabsList className="mb-4">
        <TabsTrigger value="admins">Daftar Admin</TabsTrigger>
        <TabsTrigger value="general">Pengaturan Umum</TabsTrigger>
      </TabsList>

      <TabsContent value="admins">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tambah Admin Baru</CardTitle>
              <CardDescription>
                Tambahkan alamat email admin baru untuk memberikan akses ke dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={addAdmin} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-green-50 text-green-800 border-green-100">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Admin</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {isLoading ? "Menambahkan..." : "Tambah Admin"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daftar Admin</CardTitle>
              <CardDescription>
                Email yang memiliki akses ke dashboard admin
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && <p>Memuat daftar admin...</p>}
              
              {!isLoading && adminList.length === 0 && (
                <p className="text-muted-foreground">
                  Belum ada admin yang terdaftar. Tambahkan admin pertama.
                </p>
              )}

              <ul className="space-y-2">
                {adminList.map((admin) => (
                  <li
                    key={admin.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <span className="text-sm">
                        {admin.email}
                        {currentUser?.email === admin.email && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            Anda
                          </span>
                        )}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAdmin(admin.email)}
                      disabled={isLoading || currentUser?.email === admin.email}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Umum</CardTitle>
            <CardDescription>
              Konfigurasi umum aplikasi DesaConnect
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Pengaturan umum akan segera tersedia.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 