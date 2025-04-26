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
  title: "Detail Laporan - DesaConnect",
  description: "Detail laporan masyarakat DesaConnect",
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
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        {/* Header dan breadcrumb */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Link href="/admin/dashboard/submissions">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <span className="text-muted-foreground">Detail Laporan</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {submission.reference_id}
            </h1>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className={statusColorMap[submission.status]}>
                {submission.status}
              </Badge>
              <Badge className={priorityColorMap[submission.priority]}>
                {submission.priority}
              </Badge>
              <Badge variant="outline">
                <Calendar className="h-3 w-3 mr-1" /> {formatDate(submission.created_at)}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Notifikasi sukses */}
        {updated && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Berhasil diperbarui!</AlertTitle>
            <AlertDescription className="text-green-700">
              {updated === 'status' && 'Status laporan berhasil diperbarui.'}
              {updated === 'priority' && 'Prioritas laporan berhasil diperbarui.'}
              {updated === 'comment' && 'Komentar internal berhasil ditambahkan.'}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Konten utama dengan Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
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
            <div className="grid gap-6 md:grid-cols-2">
              {/* Informasi Pelapor */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-muted-foreground" />
                    <CardTitle>Informasi Pelapor</CardTitle>
                  </div>
                  <CardDescription>Data pelapor yang mengirimkan laporan</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableHead className="w-[200px]">Nama Lengkap</TableHead>
                        <TableCell className="font-medium">{submission.name}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableHead>Kontak</TableHead>
                        <TableCell>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            {submission.contact_info}
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              {/* Informasi Laporan */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                    <CardTitle>Detail Laporan</CardTitle>
                  </div>
                  <CardDescription>Informasi mengenai laporan</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableHead className="w-[200px]">ID Referensi</TableHead>
                        <TableCell className="font-medium">{submission.reference_id}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableHead>Kategori</TableHead>
                        <TableCell>
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                            <Badge variant="outline">{submission.category}</Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            {formatDate(submission.created_at)}
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              {/* Deskripsi Laporan */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-muted-foreground" />
                    <CardTitle>Isi Laporan</CardTitle>
                  </div>
                  <CardDescription>Deskripsi masalah yang dilaporkan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border rounded-md bg-gray-50 min-h-[200px] whitespace-pre-wrap">
                    {submission.description}
                  </div>
                  
                  {submission.file_url && (
                    <div className="mt-4 flex items-center">
                      <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium mr-2">Lampiran:</span>
                      <a 
                        href={submission.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        Lihat File 
                      </a>
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