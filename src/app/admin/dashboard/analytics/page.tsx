import { Metadata } from "next";
import { protectAdminRoute, getCurrentUser } from "@/lib/auth-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubmissionStats } from "@/lib/actions/submissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Calendar, Users, TrendingUp, ArrowUpRight, Filter, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusChart, MonthlyVolumeChart, CategoryChart, TrendAreaChart, StatusLineChart } from "@/components/admin/analytics/charts";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Analitik - Admin Dashboard | Desa Pangkalan Baru",
  description: "Analisis dan grafik laporan masyarakat Desa Pangkalan Baru",
};

// Helper untuk menghasilkan data chart per bulan (contoh data)
function generateMonthlyData(stats: any) {
  const currentDate = new Date();
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  
  // Untuk contoh data, gunakan angka acak berdasarkan total laporan
  const data = months.map((month, index) => {
    const normalizedValue = Math.floor(stats.total * Math.random() * 0.4);
    const pending = Math.floor(normalizedValue * 0.3);
    const inProgress = Math.floor(normalizedValue * 0.4);
    const resolved = normalizedValue - pending - inProgress;
    
    return {
      name: month,
      total: normalizedValue,
      pending: pending,
      inProgress: inProgress,
      resolved: resolved
    };
  });
  
  return data;
}

// Fungsi untuk mengubah data kategori menjadi format pie chart
function prepareCategoryData(categories: Record<string, number>) {
  return Object.entries(categories).map(([name, value]) => ({
    name,
    value
  }));
}

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
const STATUS_COLORS = {
  pending: '#FFBB28',
  inProgress: '#0088FE',
  resolved: '#00C49F'
};

export default async function AnalyticsPage() {
  // Proteksi halaman admin (redirect jika bukan admin)
  await protectAdminRoute();
  
  // Dapatkan data user saat ini
  const user = await getCurrentUser();
  
  // Dapatkan statistik laporan
  const statsResult = await getSubmissionStats();
  const stats = statsResult.success ? statsResult.stats : {
    total: 0,
    byStatus: { pending: 0, 'in progress': 0, resolved: 0 },
    byCategory: {},
    monthlyTrends: [],
    processingTime: { averageResolutionDays: 0, averageResponseDays: 0 }
  };
  
  // Menghasilkan data untuk charts - gunakan data tren bulanan asli jika ada
  const monthlyData = stats.monthlyTrends && stats.monthlyTrends.length > 0 
    ? stats.monthlyTrends 
    : generateMonthlyData(stats);
  
  const categoryData = prepareCategoryData(stats.byCategory);
  
  // Data untuk status chart (pie chart)
  const statusData = [
    { name: 'Menunggu', value: stats.byStatus.pending || 0 },
    { name: 'Dalam Proses', value: stats.byStatus['in progress'] || 0 },
    { name: 'Terselesaikan', value: stats.byStatus.resolved || 0 }
  ];
  
  // Format persentase untuk statistik penyelesaian
  const totalReports = stats.total || 1; // Hindari pembagian dengan 0
  const resolvedPercentage = Math.round((stats.byStatus.resolved || 0) / totalReports * 100);
  
  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col mb-8">
        <div className="flex items-center mb-4">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Dashboard</span>
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Analitik Laporan</h1>
        <p className="text-muted-foreground">
          Visualisasi dan analisis data laporan masyarakat
        </p>
      </div>
      
      {/* Card statistik overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Laporan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="flex items-center mt-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Semua waktu</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Penyelesaian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{resolvedPercentage}%</div>
            <div className="flex items-center mt-1 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>{stats.byStatus.resolved || 0} terselesaikan</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Waktu Penyelesaian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.processingTime.averageResolutionDays} hari</div>
            <div className="flex items-center mt-1 text-xs text-blue-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>Rata-rata penyelesaian</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Respons Pertama</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.processingTime.averageResponseDays} hari</div>
            <div className="flex items-center mt-1 text-xs text-muted-foreground">
              <Filter className="h-3 w-3 mr-1" />
              <span>Rata-rata waktu tanggap</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-primary/10">
            <TrendingUp className="h-4 w-4 mr-2" />
            Performa
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-primary/10">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Kategori
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-primary/10">
            <LineChartIcon className="h-4 w-4 mr-2" />
            Tren Bulanan
          </TabsTrigger>
        </TabsList>
        
        {/* Tab Konten Overview */}
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Status Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Status Laporan</CardTitle>
                <CardDescription>Distribusi laporan berdasarkan status</CardDescription>
              </CardHeader>
              <CardContent>
                <StatusChart data={statusData} colors={STATUS_COLORS} />
              </CardContent>
            </Card>
            
            {/* Total Laporan Bar Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Volume Laporan Bulanan</CardTitle>
                <CardDescription>Jumlah laporan per bulan</CardDescription>
              </CardHeader>
              <CardContent>
                <MonthlyVolumeChart data={monthlyData} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Tab Konten Performa */}
        <TabsContent value="performance">
          <div className="grid gap-6">
            {/* Performance Overview Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Respons Awal</CardTitle>
                  <CardDescription>Waktu rata-rata untuk respons pertama</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-blue-600">
                        {stats.processingTime.averageResponseDays || 0}
                      </span>
                      <span className="text-muted-foreground text-sm mb-1">hari</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        (stats.processingTime.averageResponseDays || 0) <= 3 ? "bg-green-500" :
                        (stats.processingTime.averageResponseDays || 0) <= 7 ? "bg-yellow-500" : "bg-red-500"
                      )}></div>
                      <span className="text-muted-foreground">
                        {(stats.processingTime.averageResponseDays || 0) <= 3 ? "Sangat Baik" :
                         (stats.processingTime.averageResponseDays || 0) <= 7 ? "Baik" : "Perlu Perbaikan"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Dari {stats.processingTime.respondedCount || 0} laporan yang direspons
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Penyelesaian</CardTitle>
                  <CardDescription>Waktu rata-rata untuk menyelesaikan laporan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-green-600">
                        {stats.processingTime.averageResolutionDays || 0}
                      </span>
                      <span className="text-muted-foreground text-sm mb-1">hari</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        (stats.processingTime.averageResolutionDays || 0) <= 14 ? "bg-green-500" :
                        (stats.processingTime.averageResolutionDays || 0) <= 30 ? "bg-yellow-500" : "bg-red-500"
                      )}></div>
                      <span className="text-muted-foreground">
                        {(stats.processingTime.averageResolutionDays || 0) <= 14 ? "Sangat Baik" :
                         (stats.processingTime.averageResolutionDays || 0) <= 30 ? "Baik" : "Perlu Perbaikan"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Dari {stats.processingTime.resolvedCount || 0} laporan yang selesai
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Efisiensi</CardTitle>
                  <CardDescription>Tingkat penyelesaian laporan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-purple-600">
                        {Math.round(((stats.processingTime.resolvedCount || 0) / Math.max(stats.total, 1)) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        resolvedPercentage >= 80 ? "bg-green-500" :
                        resolvedPercentage >= 60 ? "bg-yellow-500" : "bg-red-500"
                      )}></div>
                      <span className="text-muted-foreground">
                        {resolvedPercentage >= 80 ? "Sangat Baik" :
                         resolvedPercentage >= 60 ? "Baik" : "Perlu Perbaikan"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stats.processingTime.resolvedCount || 0} dari {stats.total || 0} laporan
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Insights */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Target Performa</CardTitle>
                  <CardDescription>Pencapaian terhadap target waktu</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Respons Awal (Target: ≤ 3 hari)</span>
                        <span className={cn(
                          "font-medium",
                          (stats.processingTime.averageResponseDays || 0) <= 3 ? "text-green-600" : "text-red-600"
                        )}>
                          {(stats.processingTime.averageResponseDays || 0) <= 3 ? "✅ Tercapai" : "❌ Belum tercapai"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            (stats.processingTime.averageResponseDays || 0) <= 3 ? "bg-green-500" : "bg-red-500"
                          )}
                          style={{ 
                            width: `${Math.min(100, Math.max(20, 100 - (stats.processingTime.averageResponseDays || 0) * 10))}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Penyelesaian (Target: ≤ 14 hari)</span>
                        <span className={cn(
                          "font-medium",
                          (stats.processingTime.averageResolutionDays || 0) <= 14 ? "text-green-600" : "text-red-600"
                        )}>
                          {(stats.processingTime.averageResolutionDays || 0) <= 14 ? "✅ Tercapai" : "❌ Belum tercapai"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            (stats.processingTime.averageResolutionDays || 0) <= 14 ? "bg-green-500" : "bg-red-500"
                          )}
                          style={{ 
                            width: `${Math.min(100, Math.max(10, 100 - (stats.processingTime.averageResolutionDays || 0) * 3))}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Tingkat Penyelesaian (Target: ≥ 80%)</span>
                        <span className={cn(
                          "font-medium",
                          resolvedPercentage >= 80 ? "text-green-600" : "text-red-600"
                        )}>
                          {resolvedPercentage >= 80 ? "✅ Tercapai" : "❌ Belum tercapai"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            resolvedPercentage >= 80 ? "bg-green-500" : "bg-red-500"
                          )}
                          style={{ width: `${resolvedPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Rekomendasi</CardTitle>
                  <CardDescription>Saran untuk meningkatkan performa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(stats.processingTime.averageResponseDays || 0) > 3 && (
                      <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-yellow-800 text-sm">Respons Terlalu Lambat</h4>
                          <p className="text-yellow-700 text-xs mt-1">
                            Waktu respons rata-rata {stats.processingTime.averageResponseDays} hari. 
                            Pertimbangkan untuk meningkatkan monitoring dan notifikasi otomatis.
                          </p>
                        </div>
                      </div>
                    )}

                    {(stats.processingTime.averageResolutionDays || 0) > 30 && (
                      <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-red-800 text-sm">Penyelesaian Terlalu Lama</h4>
                          <p className="text-red-700 text-xs mt-1">
                            Waktu penyelesaian rata-rata {stats.processingTime.averageResolutionDays} hari. 
                            Perlu evaluasi proses dan alokasi sumber daya.
                          </p>
                        </div>
                      </div>
                    )}

                    {resolvedPercentage < 60 && (
                      <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-red-800 text-sm">Tingkat Penyelesaian Rendah</h4>
                          <p className="text-red-700 text-xs mt-1">
                            Hanya {resolvedPercentage}% laporan yang terselesaikan. 
                            Perlu peningkatan follow-up dan prioritas penanganan.
                          </p>
                        </div>
                      </div>
                    )}

                    {(stats.processingTime.averageResponseDays || 0) <= 3 && 
                     (stats.processingTime.averageResolutionDays || 0) <= 14 && 
                     resolvedPercentage >= 80 && (
                      <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-green-800 text-sm">Performa Sangat Baik</h4>
                          <p className="text-green-700 text-xs mt-1">
                            Semua target performa tercapai. Pertahankan kualitas layanan ini dan 
                            fokus pada peningkatan kepuasan masyarakat.
                          </p>
                        </div>
                      </div>
                    )}

                    {stats.total === 0 && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm">Belum Ada Data</h4>
                          <p className="text-gray-700 text-xs mt-1">
                            Belum ada laporan untuk dianalisis. Data performa akan muncul 
                            setelah ada laporan yang masuk dan diproses.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Tab Konten Kategori */}
        <TabsContent value="categories">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Kategori Pie Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Kategori Laporan</CardTitle>
                <CardDescription>Distribusi laporan berdasarkan kategori</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryChart data={categoryData} colors={COLORS} />
              </CardContent>
            </Card>
            
            {/* Detail Kategori */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Detail Kategori</CardTitle>
                <CardDescription>Jumlah laporan per kategori</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 overflow-auto">
                  <div className="space-y-4">
                    {categoryData.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-4">
                        <div className="w-full max-w-md">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{item.name}</span>
                            <span className="text-sm text-muted-foreground">{item.value}</span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full" 
                              style={{ 
                                width: `${(item.value / stats.total) * 100}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Tab Konten Tren Bulanan */}
        <TabsContent value="trends">
          <div className="grid gap-4 md:grid-cols-1">
            {/* Tren Status Laporan */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Tren Status Laporan</CardTitle>
                <CardDescription>Perubahan jumlah laporan setiap bulan berdasarkan status</CardDescription>
              </CardHeader>
              <CardContent>
                <TrendAreaChart data={monthlyData} colors={STATUS_COLORS} />
              </CardContent>
            </Card>
            
            {/* Tren per Status */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Pending Trend */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Tren Laporan Menunggu</CardTitle>
                  <CardDescription>Perubahan jumlah laporan menunggu</CardDescription>
                </CardHeader>
                <CardContent>
                  <StatusLineChart 
                    data={monthlyData} 
                    dataKey="pending" 
                    color={STATUS_COLORS.pending} 
                    name="Menunggu" 
                  />
                </CardContent>
              </Card>
              
              {/* In Progress Trend */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Tren Laporan Diproses</CardTitle>
                  <CardDescription>Perubahan jumlah laporan dalam proses</CardDescription>
                </CardHeader>
                <CardContent>
                  <StatusLineChart 
                    data={monthlyData} 
                    dataKey="inProgress" 
                    color={STATUS_COLORS.inProgress} 
                    name="Dalam Proses" 
                  />
                </CardContent>
              </Card>
              
              {/* Resolved Trend */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Tren Laporan Selesai</CardTitle>
                  <CardDescription>Perubahan jumlah laporan terselesaikan</CardDescription>
                </CardHeader>
                <CardContent>
                  <StatusLineChart 
                    data={monthlyData} 
                    dataKey="resolved" 
                    color={STATUS_COLORS.resolved} 
                    name="Terselesaikan" 
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Insights Summary Card */}
      <Card className="border-0 shadow-sm mt-8">
        <CardHeader>
          <CardTitle>Insight Analitik</CardTitle>
          <CardDescription>Ringkasan dan rekomendasi berdasarkan data laporan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Insight 1: Response Rate */}
            <div>
              <h3 className="text-base font-semibold mb-1">Tingkat Respon</h3>
              <p className="text-sm text-muted-foreground">
                {resolvedPercentage >= 70 ? (
                  <span>Tingkat penyelesaian laporan saat ini <span className="text-green-600 font-medium">{resolvedPercentage}%</span>, menunjukkan kinerja yang baik dalam menyelesaikan laporan masyarakat.</span>
                ) : resolvedPercentage >= 50 ? (
                  <span>Tingkat penyelesaian laporan saat ini <span className="text-yellow-600 font-medium">{resolvedPercentage}%</span>. Ada ruang untuk peningkatan dalam menyelesaikan laporan yang tertunda.</span>
                ) : (
                  <span>Tingkat penyelesaian laporan saat ini <span className="text-red-600 font-medium">{resolvedPercentage}%</span>. Perlu perhatian khusus untuk meningkatkan penyelesaian laporan yang tertunda.</span>
                )}
              </p>
            </div>
            
            {/* Insight 2: Processing Time */}
            <div>
              <h3 className="text-base font-semibold mb-1">Waktu Pemrosesan</h3>
              <p className="text-sm text-muted-foreground">
                {stats.processingTime.averageResolutionDays <= 3 ? (
                  <span>Rata-rata waktu penyelesaian <span className="text-green-600 font-medium">{stats.processingTime.averageResolutionDays} hari</span>, menunjukkan kecepatan respons yang sangat baik.</span>
                ) : stats.processingTime.averageResolutionDays <= 7 ? (
                  <span>Rata-rata waktu penyelesaian <span className="text-yellow-600 font-medium">{stats.processingTime.averageResolutionDays} hari</span>. Kecepatan respons cukup baik namun bisa ditingkatkan.</span>
                ) : (
                  <span>Rata-rata waktu penyelesaian <span className="text-red-600 font-medium">{stats.processingTime.averageResolutionDays} hari</span>. Perlu meningkatkan kecepatan respons terhadap laporan masyarakat.</span>
                )}
              </p>
            </div>
            
            {/* Insight 3: Top Category */}
            {categoryData.length > 0 && (
              <div>
                <h3 className="text-base font-semibold mb-1">Kategori Utama</h3>
                <p className="text-sm text-muted-foreground">
                  Kategori dengan laporan terbanyak adalah <span className="font-medium">{categoryData.sort((a, b) => b.value - a.value)[0].name}</span> dengan total {categoryData.sort((a, b) => b.value - a.value)[0].value} laporan. 
                  {categoryData.length > 1 && (
                    <> Diikuti oleh <span className="font-medium">{categoryData.sort((a, b) => b.value - a.value)[1].name}</span> dengan {categoryData.sort((a, b) => b.value - a.value)[1].value} laporan.</>
                  )}
                </p>
              </div>
            )}
            
            {/* Insight 4: Recommendations */}
            <div>
              <h3 className="text-base font-semibold mb-1">Rekomendasi</h3>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                {stats.byStatus.pending > stats.byStatus['in progress'] && (
                  <li>
                    Ada {stats.byStatus.pending} laporan menunggu dan hanya {stats.byStatus['in progress']} dalam proses.
                    Sebaiknya tingkatkan pemrosesan laporan yang masih tertunda.
                  </li>
                )}
                {stats.processingTime.averageResponseDays > 1 && (
                  <li>
                    Waktu respons pertama rata-rata {stats.processingTime.averageResponseDays} hari.
                    Tingkatkan kecepatan respons awal terhadap laporan baru.
                  </li>
                )}
                {resolvedPercentage < 70 && (
                  <li>
                    Tingkatkan penyelesaian laporan hingga minimal 70% untuk memberikan
                    layanan optimal kepada masyarakat.
                  </li>
                )}
                <li>
                  Lakukan evaluasi berkala terhadap kinerja penanganan laporan, khususnya untuk kategori 
                  dengan jumlah laporan tertinggi.
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}