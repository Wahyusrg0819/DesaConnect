"use client";

import { useState, useEffect, useCallback } from "react";
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
import { AlertCircle, CheckCircle, PlusCircle, Trash2, Loader2, RefreshCw, Import, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";

interface AdminSettingsProps {
  currentUser?: User | null;
}

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function AdminSettings({ currentUser }: AdminSettingsProps) {
  const [adminList, setAdminList] = useState<any[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [batchEmails, setBatchEmails] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [isBatchAdding, setIsBatchAdding] = useState(false);
  const [isRemovingAdmin, setIsRemovingAdmin] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const { supabase, user, isLoading: isAuthLoading } = useSupabase();
  const router = useRouter();

  // Establish email to use for API calls
  const adminEmail = currentUser?.email || user?.email;

  // Fetch admin list when component mounts or user changes
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        // Don't do anything while still checking auth
        if (isAuthLoading) {
          return;
        }

        // If we have a currentUser (from server) or a user (from client), proceed
        if (adminEmail) {
          // Don't need to verify session again as it was already done on the server
          if (mounted) {
            await fetchAdminList();
          }
        } else {
          // No user found, verify on client side once more before redirecting
          console.log('No authenticated user found, checking session');
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            console.log('No valid session found, redirecting to login');
            router.push('/admin/login');
          } else if (mounted) {
            await fetchAdminList();
          }
        }
      } catch (error) {
        console.error('Error in auth check:', error);
        if (mounted) {
          setError('Error verifying authentication');
          toast({
            variant: "destructive",
            title: "Error",
            description: "Error verifying authentication"
          });
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [adminEmail, router, isAuthLoading, supabase.auth]);

  // Filter admins when search term or admin list changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAdmins(adminList);
    } else {
      const filtered = adminList.filter(admin => 
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAdmins(filtered);
    }
  }, [searchTerm, adminList]);

  // Fungsi untuk mengambil daftar admin dari database dengan mengirimkan cookie user-email
  const fetchAdminList = useCallback(async () => {
    if (!adminEmail) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create or update user-email cookie before making the API call
      document.cookie = `user-email=${adminEmail}; path=/; max-age=3600; SameSite=Strict`;
      
      const response = await fetch('/api/admin/list-admins', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Error mengambil daftar admin");
      }

      const result = await response.json();
      
      // Sort by created_at in descending order
      const sortedAdmins = (result.admins || []).sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setAdminList(sortedAdmins);
      setFilteredAdmins(sortedAdmins);

      if (result.admins?.length === 0) {
        toast({
          title: "Informasi",
          description: "Tidak ada admin yang terdaftar"
        });
      }
    } catch (error: any) {
      console.error("Error fetching admin list:", error);
      setError(error.message || "Error mengambil daftar admin");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error mengambil daftar admin"
      });
      
      // Only redirect if it's an actual unauthorized error
      if (error.message.includes('Unauthorized')) {
          router.push('/admin/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [adminEmail, router]);

  // Fungsi untuk menambah admin baru
  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail) {
      setError("Silakan login terlebih dahulu");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Silakan login terlebih dahulu"
      });
      router.push('/admin/login');
      return;
    }

    setIsAddingAdmin(true);
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

      // Optimistic UI update
      const tempId = Date.now().toString();
      const optimisticAdmin = {
        email: emailToAdd,
        created_at: new Date().toISOString(),
        id: tempId,
        isPending: true
      };
      
      setAdminList(prev => [optimisticAdmin, ...prev]);
      setFilteredAdmins(prev => [optimisticAdmin, ...prev]);

      // Ensure the user-email cookie is set
      document.cookie = `user-email=${adminEmail}; path=/; max-age=3600; SameSite=Strict`;

      const response = await fetch('/api/admin/add-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: emailToAdd }),
      });

      if (!response.ok) {
        // Remove optimistic update on failure
        setAdminList(prev => prev.filter(admin => admin.id !== tempId));
        setFilteredAdmins(prev => prev.filter(admin => admin.id !== tempId));
        
        const result = await response.json();
        throw new Error(result.error || "Error menambahkan admin");
      }

      setNewAdminEmail("");
      toast({
        title: "Berhasil",
        description: "Admin berhasil ditambahkan",
        variant: "default"
      });
      
      // Refresh admin list to get the actual data
      await fetchAdminList();
    } catch (error: any) {
      console.error("Error adding admin:", error);
      setError(error.message || "Error menambahkan admin");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error menambahkan admin"
      });
      
      if (error.message.includes('Unauthorized')) {
        router.push('/admin/login');
      }
    } finally {
      setIsAddingAdmin(false);
    }
  };

  // Fungsi untuk menambah admin secara batch
  const addBatchAdmins = async () => {
    if (!adminEmail) {
      setError("Silakan login terlebih dahulu");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Silakan login terlebih dahulu"
      });
      router.push('/admin/login');
      return;
    }

    setIsBatchAdding(true);
    setError(null);
    setSuccess(null);

    try {
      // Parse email addresses (split by new line, comma, or semicolon)
      const emailsToAdd = batchEmails
        .split(/[\n,;]/)
        .map(email => email.trim().toLowerCase())
        .filter(email => email.length > 0);

      if (emailsToAdd.length === 0) {
        throw new Error("Tidak ada email yang valid");
      }

      // Validate each email
      const invalidEmails = emailsToAdd.filter(email => !EMAIL_REGEX.test(email));
      if (invalidEmails.length > 0) {
        throw new Error(`Format email tidak valid: ${invalidEmails.join(', ')}`);
      }

      // Filter out emails already in the admin list
      const existingEmails = adminList.map(admin => admin.email.toLowerCase());
      const newEmails = emailsToAdd.filter(email => !existingEmails.includes(email));

      if (newEmails.length === 0) {
        throw new Error("Semua email sudah terdaftar sebagai admin");
      }

      // Ensure the user-email cookie is set
      document.cookie = `user-email=${adminEmail}; path=/; max-age=3600; SameSite=Strict`;

      // Add each admin in sequence
      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      for (const email of newEmails) {
        try {
          const response = await fetch('/api/admin/add-admin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email }),
          });

          if (response.ok) {
            successCount++;
          } else {
            const result = await response.json();
            failCount++;
            errors.push(`${email}: ${result.error || "Error"}`);
          }
        } catch (err: any) {
          failCount++;
          errors.push(`${email}: ${err.message || "Unknown error"}`);
        }
      }

      // Clear batch input and close dialog
      setBatchEmails("");
      setShowBatchDialog(false);

      // Show results
      if (successCount > 0) {
        toast({
          title: "Berhasil",
          description: `${successCount} admin berhasil ditambahkan${failCount > 0 ? `, ${failCount} gagal` : ''}`,
          variant: "default"
        });
      }

      if (failCount > 0) {
        setError(`Gagal menambahkan ${failCount} admin: ${errors.join('; ')}`);
      }

      // Refresh admin list
      await fetchAdminList();
    } catch (error: any) {
      console.error("Error adding batch admins:", error);
      setError(error.message || "Error menambahkan admin");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error menambahkan admin batch"
      });
    } finally {
      setIsBatchAdding(false);
    }
  };

  // Fungsi untuk menghapus admin
  const removeAdmin = async (email: string) => {
    if (!adminEmail) {
      setError("Silakan login terlebih dahulu");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Silakan login terlebih dahulu"
      });
      router.push('/admin/login');
      return;
    }

    if (!confirm(`Yakin ingin menghapus admin dengan email ${email}?`)) {
      return;
    }

    if (adminEmail.toLowerCase() === email.toLowerCase()) {
      setError("Anda tidak dapat menghapus diri sendiri dari daftar admin");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Anda tidak dapat menghapus diri sendiri dari daftar admin"
      });
      return;
    }

    setIsRemovingAdmin(email);
    setError(null);
    setSuccess(null);

    try {
      // Optimistic UI update - mark admin as being removed
      setAdminList(prev => 
        prev.map(admin => 
          admin.email.toLowerCase() === email.toLowerCase() 
            ? { ...admin, isRemoving: true } 
            : admin
        )
      );
      setFilteredAdmins(prev => 
        prev.map(admin => 
          admin.email.toLowerCase() === email.toLowerCase() 
            ? { ...admin, isRemoving: true } 
            : admin
        )
      );

      // Ensure the user-email cookie is set
      document.cookie = `user-email=${adminEmail}; path=/; max-age=3600; SameSite=Strict`;

      const response = await fetch('/api/admin/remove-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        // Revert optimistic update
        setAdminList(prev => 
          prev.map(admin => 
            admin.email.toLowerCase() === email.toLowerCase() 
              ? { ...admin, isRemoving: false } 
              : admin
          )
        );
        setFilteredAdmins(prev => 
          prev.map(admin => 
            admin.email.toLowerCase() === email.toLowerCase() 
              ? { ...admin, isRemoving: false } 
              : admin
          )
        );
        
        const result = await response.json();
        throw new Error(result.error || "Error menghapus admin");
      }

      // Remove from list on success
      setAdminList(prev => prev.filter(admin => admin.email.toLowerCase() !== email.toLowerCase()));
      setFilteredAdmins(prev => prev.filter(admin => admin.email.toLowerCase() !== email.toLowerCase()));
      
      toast({
        title: "Berhasil",
        description: "Admin berhasil dihapus",
        variant: "default"
      });
    } catch (error: any) {
      console.error("Error removing admin:", error);
      setError(error.message || "Error menghapus admin");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error menghapus admin"
      });
      
      if (error.message.includes('Unauthorized')) {
        router.push('/admin/login');
      }
    } finally {
      setIsRemovingAdmin(null);
    }
  };

  // Funksi untuk memformat tanggal
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Tabs defaultValue="admins" className="space-y-6">
      <TabsList className="mb-6 w-full sm:w-auto overflow-auto bg-background p-1 border">
        <TabsTrigger value="admins" className="flex items-center gap-2 data-[state=active]:bg-primary/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>Daftar Admin</span>
        </TabsTrigger>
        <TabsTrigger value="general" className="flex items-center gap-2 data-[state=active]:bg-primary/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          <span>Pengaturan Umum</span>
        </TabsTrigger>
      </TabsList>

      {isAuthLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Memeriksa otentikasi...</p>
          </div>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

                    {success && (
        <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

      <TabsContent value="admins" className="space-y-6">
        <Card className="border shadow-sm">
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Daftar Admin</CardTitle>
                <CardDescription>
                  Kelola admin yang memiliki akses ke dashboard aplikasi
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fetchAdminList()}
                  disabled={isLoading}
                  className="h-9"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  Refresh
                </Button>
                <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="h-9">
                      <Import className="h-4 w-4 mr-2" />
                      Batch Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Admin Batch</DialogTitle>
                      <DialogDescription>
                        Masukkan daftar email admin, satu email per baris atau dipisahkan dengan koma/titik koma.
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      placeholder="contoh@email.com, admin2@email.com"
                      rows={6}
                      value={batchEmails}
                      onChange={(e) => setBatchEmails(e.target.value)}
                    />
                    <DialogFooter>
                      <Button
                        onClick={addBatchAdmins}
                        disabled={isBatchAdding || !batchEmails.trim()}
                      >
                        {isBatchAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Tambah Admin Batch
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Search bar */}
            <div className="relative w-full md:max-w-sm">
              <Input
                placeholder="Cari admin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Add admin form */}
            <form onSubmit={addAdmin} className="flex flex-col sm:flex-row gap-3 p-4 border rounded-md bg-muted/20">
              <div className="flex-1">
                <Label htmlFor="new-admin-email" className="text-sm font-medium mb-1.5 block">Email Admin Baru</Label>
                      <Input
                  id="new-admin-email"
                        type="email"
                  placeholder="Email admin baru"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        required
                      />
                    </div>
              <div className="sm:self-end">
                <Button
                  type="submit"
                  disabled={isAddingAdmin || !newAdminEmail.trim()}
                  className="w-full sm:w-auto"
                >
                  {isAddingAdmin ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <PlusCircle className="h-4 w-4 mr-2" />
                  )}
                  Tambah Admin
                </Button>
              </div>
            </form>

            {/* Admin list */}
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted/30 p-4 border-b grid grid-cols-12 font-medium text-sm">
                <div className="col-span-5 sm:col-span-6">Email</div>
                <div className="col-span-5 sm:col-span-4">Tanggal Ditambahkan</div>
                <div className="col-span-2 text-right">Aksi</div>
                    </div>

              {isLoading && adminList.length === 0 ? (
                <div className="p-6 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3" />
                  <p className="text-muted-foreground">Memuat daftar admin...</p>
                </div>
              ) : filteredAdmins.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="rounded-full w-12 h-12 bg-muted/50 mx-auto flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <p className="text-muted-foreground font-medium">
                    {searchTerm ? "Tidak ada admin yang cocok dengan pencarian" : "Tidak ada admin yang terdaftar"}
                  </p>
                  {searchTerm && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSearchTerm("")}
                      className="mt-2"
                    >
                      Hapus filter
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredAdmins.map((admin, index) => (
                    <div 
                      key={admin.email + index} 
                      className={`p-4 grid grid-cols-12 items-center text-sm hover:bg-muted/10 transition-colors
                        ${admin.isPending ? 'bg-blue-50/50' : ''} 
                        ${admin.isRemoving ? 'bg-red-50/50 opacity-60' : ''}`}
                    >
                      <div className="col-span-5 sm:col-span-6 flex items-center gap-2">
                        <span className="font-medium truncate">{admin.email}</span>
                        {admin.isPending && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Adding...
                          </Badge>
                        )}
                        {admin.isRemoving && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Removing...
                          </Badge>
                        )}
                        {(adminEmail?.toLowerCase() === admin.email.toLowerCase()) && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            You
                          </Badge>
                            )}
                      </div>
                      <div className="col-span-5 sm:col-span-4 text-muted-foreground">
                        {formatDate(admin.created_at)}
                        </div>
                      <div className="col-span-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAdmin(admin.email)}
                          disabled={
                            isRemovingAdmin === admin.email || 
                            admin.isRemoving || 
                            adminEmail?.toLowerCase() === admin.email.toLowerCase() || 
                            admin.isPending
                          }
                          className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-red-600 hover:bg-red-50"
                        >
                          {isRemovingAdmin === admin.email || admin.isRemoving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    ))}
                </div>
              )}
            </div>

            {filteredAdmins.length > 0 && (
              <div className="text-sm text-muted-foreground flex justify-between items-center pt-2">
                <div>
                  Menampilkan {filteredAdmins.length} dari {adminList.length} admin
                </div>
                {filteredAdmins.length !== adminList.length && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSearchTerm("")}
                  >
                    Tampilkan semua
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

      <TabsContent value="general" className="space-y-6">
        <Card className="border shadow-sm">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-xl">Pengaturan Umum</CardTitle>
                <CardDescription>
                  Konfigurasi umum aplikasi Desa Pangkalan Baru
                </CardDescription>
              </CardHeader>
          <CardContent className="p-6 space-y-8">
            {/* Notifications section */}
            <div>
              <h3 className="text-base font-medium mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                Notifikasi
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-md hover:bg-muted/10 transition-colors">
                  <div>
                    <Label htmlFor="email-notifications" className="font-medium">
                      Notifikasi Email
                    </Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Kirim email pemberitahuan saat ada laporan baru
                    </p>
                  </div>
                  <Switch id="email-notifications" />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-md hover:bg-muted/10 transition-colors">
                  <div>
                    <Label htmlFor="important-notifications" className="font-medium">
                      Notifikasi Penting
                    </Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Kirim notifikasi khusus untuk laporan yang ditandai penting
                    </p>
                  </div>
                  <Switch id="important-notifications" />
                </div>
              </div>
            </div>
            
            {/* Assignment section */}
            <div>
              <h3 className="text-base font-medium mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m22 9-10 13L2 9l10-5 10 5Z"/><path d="m6 12 6 3 6-3"/></svg>
                Penugasan
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-md hover:bg-muted/10 transition-colors">
                  <div>
                    <Label htmlFor="auto-assign" className="font-medium">
                      Auto-assign Admin
                    </Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Otomatis tugaskan admin untuk laporan baru secara bergilir
                    </p>
                  </div>
                  <Switch id="auto-assign" />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-md hover:bg-muted/10 transition-colors">
                  <div>
                    <Label htmlFor="category-based" className="font-medium">
                      Berbasis Kategori
                    </Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Assign laporan berdasarkan kategori dan spesialisasi admin
                    </p>
                  </div>
                  <Switch id="category-based" />
                </div>
              </div>
            </div>
            
            {/* API section */}
            <div>
              <h3 className="text-base font-medium mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/></svg>
                API & Integrasi
              </h3>
              <div className="space-y-4">
                <div className="p-4 border rounded-md bg-muted/20">
                  <div className="flex flex-col space-y-4">
                    <div>
                      <Label htmlFor="api-key" className="text-sm font-medium">Kunci API</Label>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="bg-muted/30 p-2.5 rounded-md border flex-1 font-mono text-xs overflow-hidden">
                          <span className="text-muted-foreground tracking-wider">••••••••••••••••••••••••••••••••</span>
                        </div>
                        <Button variant="outline" size="sm" className="shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
                          Tampilkan
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="webhook-url" className="text-sm font-medium">Webhook URL</Label>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Input 
                          id="webhook-url" 
                          placeholder="https://example.com/webhook" 
                          className="font-mono text-xs" 
                        />
                        <Button variant="outline" size="sm" className="shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/></svg>
                          Salin
                        </Button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Kunci API digunakan untuk integrasi dengan sistem eksternal. Jangan bagikan kunci ini dengan pihak yang tidak berwenang.
                  </p>
                </div>
              </div>
            </div>
              </CardContent>
          <CardFooter className="border-t bg-muted/10 p-4 flex justify-end gap-3">
            <Button variant="outline" className="h-9">
              Batal
            </Button>
            <Button className="h-9">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Simpan Pengaturan
            </Button>
          </CardFooter>
            </Card>
          </TabsContent>
    </Tabs>
  );
} 