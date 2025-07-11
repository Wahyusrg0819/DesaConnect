import { Metadata } from "next";
import { protectAdminRoute, getCurrentUser } from "@/lib/auth-utils";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSubmissionStats } from "@/lib/actions/submissions";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LineChart, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  BarChart3, 
  CalendarDays
} from "lucide-react";
import { Suspense } from "react";
import RefreshButton from "@/components/admin/refresh-button";

export const metadata: Metadata = {
  title: "Admin Dashboard - Desa Pangkalan Baru",
  description: "Dashboard admin Desa Pangkalan Baru",
};

// Komponen untuk menampilkan statistik
function StatCard({ 
  title, 
  value, 
  description, 
  icon, 
  colorClass = "" 
}: { 
  title: string; 
  value: number; 
  description: string; 
  icon: React.ReactNode; 
  colorClass?: string;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${colorClass}`}>{value}</div>
        <div className="flex items-center mt-1">
          <span className={`mr-1 ${colorClass}`}>{icon}</span>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Komponen untuk menampilkan menu cepat
function MenuCard({ 
  title, 
  description, 
  icon, 
  content, 
  footerText, 
  href 
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  footerText: string;
  href: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-primary/50 h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            <span className="text-primary group-hover:text-primary/80">{icon}</span>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{content}</CardContent>
        <CardFooter className="text-xs text-muted-foreground">{footerText}</CardFooter>
      </Card>
    </Link>
  );
}

// Komponen utama dashboard dengan caching
export default async function AdminDashboardPage() {
  // Proteksi halaman admin (redirect jika bukan admin)
  await protectAdminRoute();
  
  // Dapatkan data user saat ini
  const user = await getCurrentUser();
  
  // Dapatkan statistik laporan
  const statsResult = await getSubmissionStats();
  
  // Transformasi data statistik untuk memastikan format yang sesuai
  const stats = statsResult.success ? {
    // Mengambil data total dari API, atau nilai default jika tidak tersedia
    totalSubmissions: statsResult.stats.total || 0,
    
    // Mengambil data status atau memberikan nilai default jika tidak tersedia
    pendingCount: statsResult.stats.byStatus?.pending || 0,
    inProgressCount: statsResult.stats.byStatus?.['in progress'] || 0,
    resolvedCount: statsResult.stats.byStatus?.resolved || 0,
    
    // Mengambil data kategori atau memberikan objek kosong jika tidak tersedia
    categories: statsResult.stats.byCategory || {},
    
    // Data processing time jika tersedia
    processingTime: statsResult.stats.processingTime || {
      averageResolutionDays: 0,
      averageResponseDays: 0,
      resolvedCount: 0,
      respondedCount: 0
    }
  } : {
    totalSubmissions: 0,
    pendingCount: 0,
    inProgressCount: 0,
    resolvedCount: 0,
    categories: {},
    processingTime: {
      averageResolutionDays: 0,
      averageResponseDays: 0,
      resolvedCount: 0,
      respondedCount: 0
    }
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
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Dashboard Admin</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span className="text-sm">{formattedDate}</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <RefreshButton />
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="mb-6 w-full sm:w-auto overflow-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-primary/10">
            <BarChart3 className="h-4 w-4 mr-2" />
            <span>Statistik</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Suspense fallback={<div>Memuat statistik...</div>}>
            {/* Statistik ringkasan */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatCard
                title="Total Laporan"
                value={stats.totalSubmissions}
                description="Semua laporan yang masuk"
                icon={<AlertTriangle className="h-3 w-3" />}
              />
              
              <StatCard
                title="Menunggu"
                value={stats.pendingCount}
                description="Butuh ditinjau"
                icon={<Clock className="h-3 w-3" />}
                colorClass="text-yellow-600"
              />
              
              <StatCard
                title="Diproses"
                value={stats.inProgressCount}
                description="Sedang ditindaklanjuti"
                icon={<RefreshCw className="h-3 w-3" />}
                colorClass="text-blue-600"
              />
              
              <StatCard
                title="Selesai"
                value={stats.resolvedCount}
                description="Berhasil diselesaikan"
                icon={<CheckCircle2 className="h-3 w-3" />}
                colorClass="text-green-600"
              />
            </div>
            
            {/* Menu cepat */}
            <h2 className="text-xl font-semibold mb-4">Menu Cepat</h2>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mb-8">
              <MenuCard
                title="Kelola Laporan"
                description="Lihat dan proses semua laporan masyarakat"
                icon={<FileText className="h-5 w-5" />}
                content={
                  <div className="flex flex-col text-sm text-muted-foreground space-y-2">
                    <p>• Lihat laporan masuk</p>
                    <p>• Update status laporan</p>
                    <p>• Tambahkan tanggapan</p>
                  </div>
                }
                footerText="Akses ke semua laporan masyarakat"
                href="/admin/dashboard/submissions"
              />
              
              <MenuCard
                title="Statistik & Analisis"
                description="Lihat data statistik dan analisis laporan"
                icon={<LineChart className="h-5 w-5" />}
                content={
                  <div className="flex flex-col text-sm text-muted-foreground space-y-2">
                    <p>• Tren laporan</p>
                    <p>• Grafik kategori</p>
                    <p>• Waktu penyelesaian</p>
                  </div>
                }
                footerText="Analisis data untuk pengambilan keputusan"
                href="/admin/dashboard/analytics"
              />
              
              <MenuCard
                title="Pengaturan Admin"
                description="Kelola pengaturan aplikasi dan admin"
                icon={<Settings className="h-5 w-5" />}
                content={
                  <div className="flex flex-col text-sm text-muted-foreground space-y-2">
                    <p>• Kelola daftar admin</p>
                    <p>• Pengaturan aplikasi</p>
                    <p>• Konfigurasi notifikasi</p>
                  </div>
                }
                footerText="Pengaturan dan manajemen aplikasi"
                href="/admin/dashboard/settings"
              />
            </div>
          </Suspense>
        </TabsContent>
        
        <TabsContent value="stats">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Kategori Laporan</CardTitle>
                <CardDescription>Distribusi laporan berdasarkan kategori</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.categories).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span className="text-sm font-medium">{category}</span>
                      </div>
                      <span className="text-sm font-semibold">{Number(count) || 0}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Waktu Penyelesaian
                </CardTitle>
                <CardDescription>Rata-rata waktu respon dan penyelesaian laporan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">Rata-rata respon awal</p>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {stats.processingTime.respondedCount || 0} laporan
                      </span>
                    </div>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-bold text-blue-600">
                        {stats.processingTime.averageResponseDays || 0}
                      </p>
                      <p className="text-muted-foreground text-sm mb-1">hari</p>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${Math.min(100, (stats.processingTime.averageResponseDays / 7) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Target: {'<'} 7 hari ({stats.processingTime.averageResponseDays <= 7 ? '✅ Tercapai' : '⚠️ Perlu ditingkatkan'})
                    </p>
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">Rata-rata penyelesaian</p>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {stats.processingTime.resolvedCount || 0} selesai
                      </span>
                    </div>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-bold text-green-600">
                        {stats.processingTime.averageResolutionDays || 0}
                      </p>
                      <p className="text-muted-foreground text-sm mb-1">hari</p>
                    </div>
                    <div className="w-full bg-green-100 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${Math.min(100, (stats.processingTime.averageResolutionDays / 30) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Target: {'<'} 30 hari ({stats.processingTime.averageResolutionDays <= 30 ? '✅ Tercapai' : '⚠️ Perlu ditingkatkan'})
                    </p>
                  </div>
                  
                  {(stats.processingTime.resolvedCount === 0 && stats.processingTime.respondedCount === 0) && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                      <p>Belum ada data waktu penyelesaian</p>
                      <p className="text-xs mt-1">Data akan muncul setelah ada laporan yang diproses</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 