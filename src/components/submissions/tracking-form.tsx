"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, CalendarDays, Tag, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useSearchParams } from 'next/navigation';

interface SubmissionData {
  _id: string;
  name?: string;
  contactInfo?: string;
  category: string;
  description: string;
  createdAt: string;
  referenceId: string;
  status?: 'pending' | 'in progress' | 'resolved';
  fileUrl?: string;
}

const formSchema = z.object({
  referenceId: z.string().min(1, { message: "ID Referensi tidak boleh kosong." })
    .regex(/^[A-Z0-9]{8}$/, { message: "Format ID Referensi tidak valid (contoh: ABC123DE)." }),
});

type TrackingFormValues = z.infer<typeof formSchema>;

export default function TrackingForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [isLoading, setIsLoading] = React.useState(false);
  const [submission, setSubmission] = React.useState<SubmissionData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<TrackingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      referenceId: initialId,
    },
  });

  const fetchSubmission = async (id: string) => {
    setIsLoading(true);
    setError(null);
    setSubmission(null);
    try {
      const response = await fetch(`/api/submissions/${id}`);
      const result = await response.json();

      if (response.ok) {
        setSubmission(result as SubmissionData);
      } else {
        setError(result.message || "Laporan tidak ditemukan.");
        setSubmission(null);
         toast({
           title: "Laporan Tidak Ditemukan",
           description: result.message || `Laporan dengan ID ${id} tidak ditemukan.`,
           variant: "destructive",
         });
      }
    } catch (err: any) {
      setError("Gagal mengambil data laporan. Coba lagi nanti.");
      setSubmission(null);
       toast({
        title: "Terjadi Kesalahan",
        description: err.message || "Tidak dapat menghubungi server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (initialId) {
      const validation = formSchema.safeParse({ referenceId: initialId });
      if (validation.success) {
        fetchSubmission(initialId);
      } else {
         setError("Format ID Referensi di URL tidak valid.");
         form.reset({ referenceId: '' });
          toast({
            title: "ID Referensi Tidak Valid",
            description: "Format ID Referensi di URL tidak sesuai.",
            variant: "destructive",
          });
      }
    }
  }, [initialId]);

  async function onSubmit(values: TrackingFormValues) {
    fetchSubmission(values.referenceId);
  }

  const getStatusBadgeVariant = (status: string | undefined | null): "default" | "secondary" | "destructive" | "outline" => {
        if (typeof status !== 'string') return 'outline';
        switch (status.toLowerCase()) {
        case 'resolved':
            return 'default';
        case 'in progress':
            return 'secondary';
        case 'pending':
            return 'outline';
        default:
            return 'outline';
        }
    };

    const getStatusTextColor = (status: string | undefined | null): string => {
        if (typeof status !== 'string') return 'text-muted-foreground';
        switch (status.toLowerCase()) {
        case 'resolved':
            return 'text-primary';
        case 'in progress':
            return 'text-yellow-600 dark:text-yellow-400';
        case 'pending':
            return 'text-muted-foreground';
        default:
            return 'text-muted-foreground';
        }
    };


  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Lacak Laporan</CardTitle>
          <CardDescription>Masukkan ID referensi laporan Anda untuk melihat statusnya.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="referenceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Referensi</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: ABC123DE" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mencari...
                  </>
                ) : (
                   <>
                    <Search className="mr-2 h-4 w-4" />
                    Lacak Laporan
                   </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Display Submission Details or Loading/Error */}
      {(isLoading || submission || error) && (
        <Card className="mt-6 shadow-md rounded-lg border border-primary/20">
           {isLoading && (
               <CardContent className="text-center p-6">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  <p className="mt-2 text-muted-foreground">Memuat detail laporan...</p>
               </CardContent>
            )}

           {error && !isLoading && (
               <CardContent className="p-4 flex items-center gap-3">
                   <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
                   <p className="text-sm text-destructive font-medium">{error}</p>
               </CardContent>
           )}


           {submission && !isLoading && !error && (
               <>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-primary">Detail Laporan #{submission.referenceId}</CardTitle>
                  <CardDescription>Status terakhir laporan Anda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                   {submission.name && (
                       <div className="flex items-center gap-2">
                           <span className="font-medium">Nama:</span>
                           <span>{submission.name}</span>
                       </div>
                   )}
                    {submission.contactInfo && (
                       <div className="flex items-center gap-2">
                           <span className="font-medium">Kontak:</span>
                           <span>{submission.contactInfo}</span>
                       </div>
                   )}
                  <div className="flex items-center gap-2">
                     <Tag className="h-4 w-4 text-muted-foreground" />
                     <span className="font-medium">Kategori:</span>
                     <span>{submission.category}</span>
                  </div>
                   <div className="flex items-center gap-2">
                     <CalendarDays className="h-4 w-4 text-muted-foreground" />
                     <span className="font-medium">Tanggal Dibuat:</span>
                     <span>{format(new Date(submission.createdAt), 'dd MMMM yyyy, HH:mm', { locale: id })}</span>
                  </div>
                   <div className="flex items-start gap-2">
                     <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                     <span className="font-medium">Deskripsi:</span>
                     <p className="text-muted-foreground">{submission.description}</p>
                  </div>
                   {submission.fileUrl && (
                      <div className="flex items-center gap-2">
                           <span className="font-medium">Lampiran:</span>
                           <Button variant="link" size="sm" asChild className="p-0 h-auto text-accent hover:text-accent/80">
                              <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">Lihat File</a>
                          </Button>
                      </div>
                   )}
                </CardContent>
                 <CardFooter className="bg-secondary/50 p-4 rounded-b-lg flex justify-between items-center">
                      <span className="font-medium text-foreground">Status Saat Ini:</span>
                      <Badge variant={getStatusBadgeVariant(submission.status)} className={`capitalize text-base px-3 py-1 ${getStatusTextColor(submission.status)}`}>
                          {submission.status}
                      </Badge>
                 </CardFooter>
              </>
           )}
        </Card>
      )}
    </div>
  );
}
