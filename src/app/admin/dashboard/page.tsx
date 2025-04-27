import { Metadata } from "next";
import { protectAdminRoute, getCurrentUser } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { handleLogout } from "@/lib/actions/dashboard-actions";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSubmissionStats } from "@/lib/actions/submissions";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LineChart, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  LogOut,
  BarChart3, 
  CalendarDays
} from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard - DesaConnect",
  description: "Dashboard admin DesaConnect",
};

export default async function AdminDashboardPage() {
  // Proteksi halaman admin (redirect jika bukan admin)
  await protectAdminRoute();
  
  // Dapatkan data user saat ini
  const user = await getCurrentUser();
  
  // Dapatkan statistik laporan
  const statsResult = await getSubmissionStats();
  const stats = statsResult.success ? statsResult.stats : {
    totalSubmissions: 0,
    pendingCount: 0,
    inProgressCount: 0,
    resolvedCount: 0,
    categories: {},
    recentSubmissions: []
  };
  
  // Mendapatkan tanggal saat ini untuk ditampilkan
  const today = new Date();
  const formattedDate = today.toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Dashboard Admin</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 px-3 py-1 rounded-full flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-sm font-medium">{user?.email}</span>
          </div>
          <form action={handleLogout}>
            <Button variant="outline" size="sm" type="submit" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </form>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-primary/10">
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistik
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {/* Statistik ringkasan */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Laporan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalSubmissions}</div>
                <p className="text-xs text-muted-foreground mt-1">Semua laporan yang masuk</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Menunggu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{stats.pendingCount}</div>
                <div className="flex items-center mt-1">
                  <Clock className="h-3 w-3 text-yellow-600 mr-1" />
                  <p className="text-xs text-muted-foreground">Butuh ditinjau</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sedang Diproses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.inProgressCount}</div>
                <div className="flex items-center mt-1">
                  <RefreshCw className="h-3 w-3 text-blue-600 mr-1" />
                  <p className="text-xs text-muted-foreground">Dalam pengerjaan</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Terselesaikan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.resolvedCount}</div>
                <div className="flex items-center mt-1">
                  <CheckCircle2 className="h-3 w-3 text-green-600 mr-1" />
                  <p className="text-xs text-muted-foreground">Sudah diselesaikan</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <h2 className="text-xl font-bold mb-4">Menu Cepat</h2>
          
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/admin/dashboard/submissions" className="group">
              <Card className="border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-primary/50 h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">Kelola Laporan</CardTitle>
                    <FileText className="h-5 w-5 text-primary group-hover:text-primary/80" />
                  </div>
                  <CardDescription>
                    Lihat dan kelola laporan dari masyarakat
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                      {stats.pendingCount} menunggu
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                      {stats.inProgressCount} diproses
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  Klik untuk melihat semua laporan
                </CardFooter>
              </Card>
            </Link>
            
            <Link href="/admin/dashboard/analytics" className="group">
              <Card className="border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-primary/50 h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">Analitik</CardTitle>
                    <LineChart className="h-5 w-5 text-primary group-hover:text-primary/80" />
                  </div>
                  <CardDescription>
                    Lihat statistik dan grafik laporan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-sm">
                      Analisis data dari {stats.totalSubmissions} total laporan
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  Klik untuk melihat analitik
                </CardFooter>
              </Card>
            </Link>
            
            <Link href="/admin/dashboard/settings" className="group">
              <Card className="border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-primary/50 h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">Pengaturan</CardTitle>
                    <Settings className="h-5 w-5 text-primary group-hover:text-primary/80" />
                  </div>
                  <CardDescription>
                    Konfigurasi dan pengaturan akun
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-sm">
                      Kelola admin dan pengaturan aplikasi
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  Klik untuk mengatur sistem
                </CardFooter>
              </Card>
            </Link>
          </div>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Statistik Laporan</CardTitle>
              <CardDescription>
                Ringkasan laporan berdasarkan kategori dan status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium mb-2">Berdasarkan Kategori</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.categories || {}).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                          <span className="text-sm">{category}</span>
                        </div>
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Berdasarkan Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                        <span className="text-sm">Menunggu</span>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                        {stats.pendingCount}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                        <span className="text-sm">Sedang Diproses</span>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {stats.inProgressCount}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm">Terselesaikan</span>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {stats.resolvedCount}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 