import { Metadata } from "next";
import { notFound } from "next/navigation";
import { protectAdminRoute } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  getSubmissionById, 
  updateSubmissionStatus, 
  updateSubmissionPriority,
  addInternalComment
} from "@/lib/actions/submission-actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  ArrowLeft, 
  FileText, 
  User, 
  Phone, 
  Calendar, 
  Tag, 
  Clock, 
  AlertTriangle,
  MessageSquare,
  Paperclip
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Detail Laporan - Desa Pangkalan Baru",
  description: "Detail laporan masyarakat Desa Pangkalan Baru",
};

// Menambahkan cache control untuk memastikan data selalu fresh
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Status badge color mapping
const statusColorMap: Record<string, string> = {
  'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'in progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'resolved': 'bg-green-100 text-green-800 border-green-200',
};

// Priority badge color mapping
const priorityColorMap: Record<string, string> = {
  'Urgent': 'bg-red-100 text-red-800 border-red-200',
  'Regular': 'bg-gray-100 text-gray-800 border-gray-200',
};

export default async function SubmissionDetailPage({ 
  params, 
  searchParams
}: { 
  params: { id: string },
  searchParams: { updated?: string } 
}) {
  // Proteksi halaman admin
  await protectAdminRoute();
  
  // Mengambil params dan searchParams dengan benar (dengan await)
  const { id } = await params;
  const { updated } = await searchParams;
  
  // Fetch data laporan berdasarkan ID
  const submission = await getSubmissionById(id);
  
  // Jika laporan tidak ditemukan, tampilkan 404
  if (!submission) {
    notFound();
  }
  
  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col space-y-6">
        {/* Header dan breadcrumb */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin/dashboard/submissions">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold tracking-tight">Detail Laporan</h1>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="font-medium text-lg">{submission.reference_id}</div>
              <div className="flex items-center gap-2">
                <Badge className={`${statusColorMap[submission.status]} flex items-center gap-1.5`}>
                  {submission.status === 'pending' && <Clock className="h-3.5 w-3.5" />}
                  {submission.status === 'in progress' && <Clock className="h-3.5 w-3.5" />}
                  {submission.status === 'resolved' && <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span>{submission.status}</span>
                </Badge>
                <Badge className={priorityColorMap[submission.priority]}>
                  {submission.priority}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(submission.created_at)}</span>
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-6" />
          </div>
        </div>
        
        {/* Notifikasi sukses */}
        {updated && (
          <Alert className="bg-green-50 border-green-200 border-l-4 border-l-green-500">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800 font-medium">Berhasil diperbarui!</AlertTitle>
            <AlertDescription className="text-green-700">
              {updated === 'status' && 'Status laporan berhasil diperbarui.'}
              {updated === 'priority' && 'Prioritas laporan berhasil diperbarui.'}
              {updated === 'comment' && 'Komentar internal berhasil ditambahkan.'}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Konten utama dengan Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4 w-full sm:w-auto inline-flex">
            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
            <TabsTrigger value="management">Pengelolaan</TabsTrigger>
            <TabsTrigger value="comments">
              Komentar{' '}
              {submission.internal_comments?.length > 0 && (
                <Badge variant="secondary" className="ml-1">{submission.internal_comments.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          {/* Tab Overview */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Informasi Pelapor */}
              <Card className="md:col-span-1 shadow-sm border-0">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-full mr-3">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Informasi Pelapor</CardTitle>
                      <CardDescription>Data pelapor yang mengirimkan laporan</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Nama Lengkap</div>
                      <div className="font-medium">{submission.name || 'Tidak disebutkan'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Kontak</div>
                      <div className="font-medium flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        {submission.contact_info || 'Tidak disebutkan'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Informasi Laporan */}
              <Card className="md:col-span-2 shadow-sm border-0">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-full mr-3">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Detail Laporan</CardTitle>
                      <CardDescription>Informasi mengenai laporan</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">ID Referensi</div>
                      <div className="font-medium">{submission.reference_id}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Kategori</div>
                      <div className="font-medium flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Badge variant="outline">{submission.category}</Badge>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Tanggal</div>
                      <div className="font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formatDate(submission.created_at)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Deskripsi Laporan */}
              <Card className="md:col-span-3 shadow-sm border-0">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-full mr-3">
                      <MessageSquare className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Isi Laporan</CardTitle>
                      <CardDescription>Deskripsi masalah yang dilaporkan</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="p-4 border rounded-md bg-muted/20 min-h-[200px] whitespace-pre-wrap text-sm">
                    {submission.description}
                  </div>
                  
                  {submission.file_url && (
                    <div className="mt-4 p-3 border rounded-md bg-blue-50 border-blue-200">
                      <div className="flex items-center">
                        <Paperclip className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="font-medium mr-2 text-blue-700">Lampiran:</span>
                        <a 
                          href={submission.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Unduh Lampiran
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Tab Management */}
          <TabsContent value="management">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Update Status */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                    <CardTitle>Update Status</CardTitle>
                  </div>
                  <CardDescription>Perbarui status penanganan laporan</CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={updateSubmissionStatus} className="space-y-4">
                    <input type="hidden" name="id" value={submission.id} />
                    <div className="space-y-2">
                      <Label htmlFor="status">Status Saat Ini:</Label>
                      <div className="flex items-center space-x-2">
                        <Badge className={statusColorMap[submission.status]}>
                          {submission.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Ubah Status:</Label>
                      <div className="flex gap-2">
                        <Select name="status" defaultValue={submission.status}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button type="submit">Update Status</Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
              
              {/* Update Prioritas */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-muted-foreground" />
                    <CardTitle>Update Prioritas</CardTitle>
                  </div>
                  <CardDescription>Tetapkan prioritas penanganan laporan</CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={updateSubmissionPriority} className="space-y-4">
                    <input type="hidden" name="id" value={submission.id} />
                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioritas Saat Ini:</Label>
                      <div className="flex items-center space-x-2">
                        <Badge className={priorityColorMap[submission.priority]}>
                          {submission.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Ubah Prioritas:</Label>
                      <div className="flex gap-2">
                        <Select name="priority" defaultValue={submission.priority}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih Prioritas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                            <SelectItem value="Regular">Regular</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button type="submit">Update Prioritas</Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Tab Comments */}
          <TabsContent value="comments">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-muted-foreground" />
                  <CardTitle>Komentar Internal</CardTitle>
                </div>
                <CardDescription>Komentar internal untuk laporan ini (tidak terlihat oleh pelapor)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Daftar komentar internal */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {submission.internal_comments && submission.internal_comments.length > 0 ? (
                    submission.internal_comments.map((comment: any, index: number) => (
                      <Card key={comment.id || index} className="border-gray-200">
                        <CardHeader className="py-3 px-4">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">Komentar Admin</div>
                            <div className="text-sm text-gray-500">
                              {formatDate(comment.timestamp)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="py-3 px-4">
                          <p className="whitespace-pre-wrap">{comment.text}</p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Belum ada komentar internal.</p>
                    </div>
                  )}
                </div>
                
                {/* Form tambah komentar */}
                <Card className="border-gray-200">
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-base">Tambah Komentar</CardTitle>
                  </CardHeader>
                  <CardContent className="py-3 px-4">
                    <form action={addInternalComment} className="space-y-4">
                      <input type="hidden" name="id" value={submission.id} />
                      <div className="space-y-2">
                        <Label htmlFor="comment">Catatan:</Label>
                        <Textarea 
                          name="comment" 
                          placeholder="Tulis komentar internal..."
                          className="resize-none"
                          rows={4}
                        />
                      </div>
                      <Button type="submit" className="w-full">Tambah Komentar</Button>
                    </form>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 