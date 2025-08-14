import { Metadata } from "next";
import { protectAdminRoute } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import { createClient } from '@supabase/supabase-js';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  RefreshCw, 
  FileSpreadsheet, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Filter, 
  Eye, 
  XCircle, 
  CalendarDays,
  FilePenLine,
  SlidersHorizontal,
  Calendar
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';


export const metadata: Metadata = {
  title: "Kelola Laporan - Desa Pangkalan Baru",
  description: "Manajemen laporan masyarakat Desa Pangkalan Baru",
};

// Menambahkan cache control untuk memastikan data selalu fresh
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Fungsi untuk membuat Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables not set");
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Service function untuk mengambil data submissions
async function getSubmissions(params?: { 
  status?: string; 
  category?: string; 
  priority?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  "use server";
  
  try {
    console.log('Fetching submissions data with params:', params);
    const supabase = getSupabaseClient();
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    let query = supabase
      .from('submissions')
      .select('*', { count: 'exact' });
    
    // Apply filters if provided
    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }
    
    if (params?.category && params.category !== 'all') {
      query = query.eq('category', params.category);
    }
    
    if (params?.priority && params.priority !== 'all') {
      query = query.eq('priority', params.priority);
    }
    
    if (params?.search) {
      query = query.or(`reference_id.ilike.%${params.search}%,name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }
    
    if (params?.startDate) {
      query = query.gte('created_at', params.startDate);
    }
    
    if (params?.endDate) {
      // Add one day to include the end date fully
      const endDate = new Date(params.endDate);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString());
    }
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      console.error('Error fetching submissions:', error.message);
      return { data: [], count: 0 };
    }
    
    console.log(`Retrieved ${data.length} submissions`);
    return { data, count: count ?? 0 };
  } catch (error) {
    console.error('Error in getSubmissions:', error);
    return { data: [], count: 0 };
  }
}

// Status badge color mapping
const statusColorMap: Record<string, string> = {
  'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'in progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'resolved': 'bg-green-100 text-green-800 border-green-200',
};

// Status icon mapping
const statusIconMap: Record<string, React.ReactNode> = {
  'pending': <Clock className="h-3.5 w-3.5" />,
  'in progress': <RefreshCw className="h-3.5 w-3.5" />,
  'resolved': <CheckCircle className="h-3.5 w-3.5" />,
};

// Priority badge color mapping
const priorityColorMap: Record<string, string> = {
  'Urgent': 'bg-red-100 text-red-800 border-red-200',
  'Regular': 'bg-gray-100 text-gray-800 border-gray-200',
};

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: { 
    status?: string; 
    category?: string; 
    priority?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    tab?: string;
    page?: string;
  };
}) {
  // Proteksi halaman admin
  await protectAdminRoute();
  
  const currentPage = Number(searchParams?.page) || 1;
  const limit = 10;

  // Map tab values to status values
  const tabToStatus = {
    'all': undefined,
    'pending': 'pending',
    'inprogress': 'in progress',
    'resolved': 'resolved'
  };
  
  // Await search parameters
  const params = await Promise.resolve({
    status: searchParams?.tab ? tabToStatus[searchParams.tab as keyof typeof tabToStatus] : searchParams?.status,
    category: searchParams?.category,
    priority: searchParams?.priority,
    search: searchParams?.search,
    startDate: searchParams?.startDate,
    endDate: searchParams?.endDate,
    tab: searchParams?.tab || 'all'
  });

  // Get submissions with awaited parameters
  const { data: submissions, count: totalCount } = await getSubmissions({
    ...params,
    page: currentPage,
    limit,
  });

  const totalPages = Math.ceil(totalCount / limit);

  // Filter submissions based on search, category, priority, and date range first
  const baseFilteredSubmissions = submissions;

  // Now filter by status/tab
  const filteredSubmissions = params.tab === 'all' 
    ? baseFilteredSubmissions 
    : baseFilteredSubmissions.filter(s => s.status === tabToStatus[params.tab as keyof typeof tabToStatus]);

  // Calculate counts from baseFilteredSubmissions for accurate numbers in tabs
  const pendingCount = baseFilteredSubmissions.filter(s => s.status === 'pending').length;
  const inProgressCount = baseFilteredSubmissions.filter(s => s.status === 'in progress').length;
  const resolvedCount = baseFilteredSubmissions.filter(s => s.status === 'resolved').length;
  const urgentCount = baseFilteredSubmissions.filter(s => s.priority === 'Urgent').length;

  // Rest of your component code using params instead of searchParams directly
  const { 
    status,
    category = 'all', 
    priority = 'all', 
    search = '', 
    startDate, 
    endDate, 
    tab 
  } = params;
  
  // Dapatkan 5 laporan terbaru untuk highlight
  const recentSubmissions = submissions.slice(0, 5);
  
  // Get unique categories for filter from all submissions
  const categories = Array.from(new Set(submissions.map((s: any) => s.category)));
  
  // Group by category for chart/stats using filtered submissions
  const categoryCounts = baseFilteredSubmissions.reduce((acc: Record<string, number>, submission: any) => {
    const category = submission.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category]++;
    return acc;
  }, {});
  const totalSubmissions = submissions.length;
  const sortedCategoryEntries = Object.entries(categoryCounts).sort((a, b) => (b[1] as number) - (a[1] as number));
  
  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Kelola Laporan</h1>
          </div>
          <p className="text-muted-foreground">
            Lihat dan kelola seluruh laporan dari masyarakat
          </p>
        </div>
        <div className="flex items-center gap-2" />
      </div>
      
      {/* Statistik Card */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 mb-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2 pt-4 border-l-4 border-yellow-400">
            <CardTitle className="text-sm font-medium text-muted-foreground">Menunggu</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{pendingCount}</div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Laporan perlu ditinjau</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2 pt-4 border-l-4 border-blue-400">
            <CardTitle className="text-sm font-medium text-muted-foreground">Diproses</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{inProgressCount}</div>
              <div className="p-2 bg-blue-100 rounded-full">
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Laporan sedang ditindaklanjuti</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2 pt-4 border-l-4 border-green-400">
            <CardTitle className="text-sm font-medium text-muted-foreground">Selesai</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{resolvedCount}</div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Laporan telah diselesaikan</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2 pt-4 border-l-4 border-red-400">
            <CardTitle className="text-sm font-medium text-muted-foreground">Urgen</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{urgentCount}</div>
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Laporan prioritas tinggi</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue={tab} className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <TabsList className="mb-0">
            <TabsTrigger value="all" asChild>
              <Link href={{ 
                pathname: '/admin/dashboard/submissions', 
                query: { 
                  tab: 'all',
                  ...(search ? { search } : {}),
                  ...(category !== 'all' ? { category } : {}),
                  ...(priority !== 'all' ? { priority } : {}),
                  ...(startDate ? { startDate } : {}),
                  ...(endDate ? { endDate } : {})
                } 
              }}>
                <div className="flex items-center gap-2">
                  <span>Semua</span>
                  <Badge variant="secondary" className="ml-1">{totalCount}</Badge>
                </div>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="pending" asChild>
              <Link href={{ 
                pathname: '/admin/dashboard/submissions', 
                query: { 
                  tab: 'pending',
                  ...(search ? { search } : {}),
                  ...(category !== 'all' ? { category } : {}),
                  ...(priority !== 'all' ? { priority } : {}),
                  ...(startDate ? { startDate } : {}),
                  ...(endDate ? { endDate } : {})
                } 
              }}>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Menunggu</span>
                  <Badge variant="secondary" className="ml-1">{pendingCount}</Badge>
                </div>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="inprogress" asChild>
              <Link href={{ 
                pathname: '/admin/dashboard/submissions', 
                query: { 
                  tab: 'inprogress',
                  ...(search ? { search } : {}),
                  ...(category !== 'all' ? { category } : {}),
                  ...(priority !== 'all' ? { priority } : {}),
                  ...(startDate ? { startDate } : {}),
                  ...(endDate ? { endDate } : {})
                } 
              }}>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Diproses</span>
                  <Badge variant="secondary" className="ml-1">{inProgressCount}</Badge>
                </div>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="resolved" asChild>
              <Link href={{ 
                pathname: '/admin/dashboard/submissions', 
                query: { 
                  tab: 'resolved',
                  ...(search ? { search } : {}),
                  ...(category !== 'all' ? { category } : {}),
                  ...(priority !== 'all' ? { priority } : {}),
                  ...(startDate ? { startDate } : {}),
                  ...(endDate ? { endDate } : {})
                } 
              }}>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Selesai</span>
                  <Badge variant="secondary" className="ml-1">{resolvedCount}</Badge>
                </div>
              </Link>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <Card className="border-0 shadow-sm mb-4">
          <CardHeader className="py-4">
            <CardTitle className="text-base flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filter Lanjutan
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <form className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Pencarian */}
              <div>
                <Label htmlFor="search" className="text-xs mb-1.5 block">Pencarian</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    type="search"
                    name="search"
                    placeholder="ID, nama, atau deskripsi..."
                    className="pl-9 w-full"
                    defaultValue={search}
                  />
                </div>
              </div>
              
              {/* Kategori */}
              <div>
                <Label htmlFor="category" className="text-xs mb-1.5 block">Kategori</Label>
                <Select name="category" defaultValue={category}>
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {categories.map((cat: string) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Prioritas */}
              <div>
                <Label htmlFor="priority" className="text-xs mb-1.5 block">Prioritas</Label>
                <Select name="priority" defaultValue={priority}>
                  <SelectTrigger id="priority" className="w-full">
                    <SelectValue placeholder="Semua Prioritas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Prioritas</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Rentang tanggal */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="startDate" className="text-xs mb-1.5 block">Dari Tanggal</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="startDate"
                      type="date"
                      name="startDate"
                      className="pl-9 w-full"
                      defaultValue={startDate}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-xs mb-1.5 block">Sampai Tanggal</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="endDate"
                      type="date"
                      name="endDate"
                      className="pl-9 w-full"
                      defaultValue={endDate}
                    />
                  </div>
                </div>
              </div>
              
              {/* Tombol filter */}
              <div className="sm:col-span-2 md:col-span-4 flex justify-end gap-2 mt-2">
                <Link href="/admin/dashboard/submissions" className="inline-flex">
                  <Button variant="outline" type="button">
                    <XCircle className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </Link>
                <Button type="submit">
                  <Filter className="mr-2 h-4 w-4" />
                  Terapkan Filter
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <TabsContent value={tab} className="m-0">
          <Card className="border-0 shadow-sm">
            <CardHeader className="py-4">
              <CardTitle className="text-base">
                {tab === 'all' && 'Semua Laporan'}
                {tab === 'pending' && 'Laporan Menunggu'}
                {tab === 'inprogress' && 'Laporan Diproses'}
                {tab === 'resolved' && 'Laporan Selesai'}
              </CardTitle>
              <CardDescription>
                {search || category !== 'all' || priority !== 'all' || startDate || endDate ? (
                  <>Menampilkan hasil filter: {filteredSubmissions.length} laporan ditemukan</>
                ) : (
                  <>Total {totalCount} laporan ditemukan</>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="font-medium">ID Referensi</TableHead>
                      <TableHead className="font-medium">Kategori</TableHead>
                      <TableHead className="font-medium">Tanggal</TableHead>
                      <TableHead className="font-medium">Status</TableHead>
                      <TableHead className="font-medium">Prioritas</TableHead>
                      <TableHead className="font-medium text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="bg-muted/20 p-3 rounded-full">
                              <Search className="h-6 w-6 text-muted-foreground/80" />
                            </div>
                            <div className="font-medium">Tidak ada laporan yang ditemukan</div>
                            <div className="text-sm text-muted-foreground/70">
                              {search || category !== 'all' || priority !== 'all' || startDate || endDate ? (
                                <>Silakan coba filter atau kata kunci yang berbeda</>
                              ) : (
                                <>Belum ada laporan yang masuk dalam kategori ini</>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubmissions.map((submission: any) => (
                        <TableRow key={submission.id} className="group">
                          <TableCell>
                            <div className="font-medium">{submission.reference_id}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                              {submission.name || 'Anonim'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {submission.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <CalendarDays className="h-3.5 w-3.5" />
                              <span className="text-xs">{formatDate(submission.created_at)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusColorMap[submission.status]} flex items-center gap-1.5`}>
                              {statusIconMap[submission.status]}
                              <span>{submission.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={priorityColorMap[submission.priority]}>
                              {submission.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center space-x-1">
                              <Link href={`/admin/dashboard/submissions/${submission.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-70 group-hover:opacity-100">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t py-4 px-6">
              <div className="text-xs text-muted-foreground">
                Menampilkan {filteredSubmissions.length} dari {totalCount} laporan
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href={{ 
                        pathname: '/admin/dashboard/submissions', 
                        query: {
                          status,
                          category,
                          priority,
                          search,
                          startDate,
                          endDate,
                          tab,
                          page: currentPage > 1 ? currentPage - 1 : 1
                        }
                      }}
                      aria-disabled={currentPage <= 1}
                      tabIndex={currentPage <= 1 ? -1 : undefined}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : undefined}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        href={{ 
                          pathname: '/admin/dashboard/submissions', 
                          query: {
                            status,
                            category,
                            priority,
                            search,
                            startDate,
                            endDate,
                            tab,
                            page: i + 1
                          }
                        }}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      href={{ 
                        pathname: '/admin/dashboard/submissions', 
                        query: {
                          status,
                          category,
                          priority,
                          search,
                          startDate,
                          endDate,
                          tab,
                          page: currentPage < totalPages ? currentPage + 1 : totalPages
                        }
                      }}
                      aria-disabled={currentPage >= totalPages}
                      tabIndex={currentPage >= totalPages ? -1 : undefined}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : undefined}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="grid gap-6">
        <div>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Statistik Kategori</CardTitle>
              <CardDescription>Distribusi laporan berdasarkan kategori</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(categoryCounts).length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  Belum ada data kategori
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedCategoryEntries.map(([category, count]) => {
                    const percent = totalSubmissions > 0 ? Math.round(((count as number) / totalSubmissions) * 100) : 0;
                    return (
                      <div key={category} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-2 w-2 rounded-full bg-primary/70" />
                            <span className="text-sm font-medium">{category}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="h-5 px-2 text-[10px]">{count}</Badge>
                            <span>{percent}%</span>
                          </div>
                        </div>
                        <Progress value={percent} />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    );
  }