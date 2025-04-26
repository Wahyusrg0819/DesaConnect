import { Metadata } from "next";
import { protectAdminRoute } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { createClient } from '@supabase/supabase-js';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, FileSpreadsheet } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const metadata: Metadata = {
  title: "Kelola Laporan - DesaConnect",
  description: "Manajemen laporan masyarakat DesaConnect",
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
async function getSubmissions() {
  "use server";
  
  try {
    console.log('Fetching submissions data...');
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching submissions:', error.message);
      return [];
    }
    
    console.log(`Retrieved ${data.length} submissions`);
    return data;
  } catch (error) {
    console.error('Error in getSubmissions:', error);
    return [];
  }
}

// Status badge color mapping
const statusColorMap: Record<string, string> = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'in progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'resolved': 'bg-green-100 text-green-800 border-green-200',
};

// Priority badge color mapping
const priorityColorMap: Record<string, string> = {
  'Urgent': 'bg-red-100 text-red-800 border-red-200',
  'Regular': 'bg-gray-100 text-gray-800 border-gray-200',
};

export default async function SubmissionsPage() {
  // Proteksi halaman admin
  await protectAdminRoute();
  
  // Fetch data laporan
  const submissions = await getSubmissions();
  
  // Menghitung statistik laporan
  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const inProgressCount = submissions.filter(s => s.status === 'in progress').length;
  const resolvedCount = submissions.filter(s => s.status === 'resolved').length;
  const urgentCount = submissions.filter(s => s.priority === 'Urgent').length;
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Laporan</h1>
          <p className="text-muted-foreground">
            Lihat dan kelola seluruh laporan dari masyarakat
          </p>
        </div>
        <Link href="/admin/dashboard">
          <Button variant="outline">Kembali ke Dashboard</Button>
        </Link>
      </div>
      
      {/* Statistik dan Filter */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-yellow-800">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{pendingCount}</div>
            <p className="text-sm text-yellow-800">Laporan menunggu</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-800">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{inProgressCount}</div>
            <p className="text-sm text-blue-800">Laporan diproses</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-800">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{resolvedCount}</div>
            <p className="text-sm text-green-800">Laporan selesai</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-red-800">Urgent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{urgentCount}</div>
            <p className="text-sm text-red-800">Laporan prioritas tinggi</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filter dan pencarian */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Filter dan Pencarian</CardTitle>
          <CardDescription>Cari dan filter laporan untuk memudahkan manajemen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Cari berdasarkan nama, ID, atau kategori..."
                className="pl-8"
              />
            </div>
            <Select>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter Prioritas" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Prioritas</SelectLabel>
                  <SelectItem value="all">Semua Prioritas</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button className="md:w-auto" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Daftar Laporan</CardTitle>
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
          <CardDescription>Total {submissions.length} laporan ditemukan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium">ID Referensi</TableHead>
                  <TableHead className="font-medium">Nama</TableHead>
                  <TableHead className="font-medium">Kategori</TableHead>
                  <TableHead className="font-medium">Tanggal</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Prioritas</TableHead>
                  <TableHead className="font-medium w-[120px]">Komentar</TableHead>
                  <TableHead className="font-medium">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Search className="h-8 w-8 text-gray-400" />
                        <div className="font-medium">Tidak ada laporan yang ditemukan</div>
                        <div className="text-sm text-gray-400">Silakan coba filter atau kata kunci yang berbeda</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  submissions.map((submission: any) => (
                    <TableRow key={submission.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{submission.reference_id}</TableCell>
                      <TableCell>{submission.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{submission.category}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(submission.created_at)}</TableCell>
                      <TableCell>
                        <Badge className={statusColorMap[submission.status]}>
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColorMap[submission.priority]}>
                          {submission.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {submission.internal_comments && submission.internal_comments.length > 0 ? (
                          <Badge variant="outline" className="bg-blue-50 border-blue-200">
                            {submission.internal_comments.length} komentar
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/dashboard/submissions/${submission.id}`}>
                          <Button variant="outline" size="sm">Detail</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 