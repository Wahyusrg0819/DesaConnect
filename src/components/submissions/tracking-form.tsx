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
import { Loader2, Search, CalendarDays, Tag, FileText, AlertCircle, CheckCircle, Timer, Clock, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useSearchParams } from 'next/navigation';
import type { Submission } from '@/lib/types'; // Gunakan type Submission yang sudah ada

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
  const [submission, setSubmission] = React.useState<Submission | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [formattedDate, setFormattedDate] = React.useState<string>('Memuat tanggal...');

  const form = useForm<TrackingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      referenceId: initialId,
    },
  });

  // Format tanggal setelah komponen di-mount untuk menghindari hydration error
  React.useEffect(() => {
    if (submission?.createdAt) {
      try {
        const date = new Date(submission.createdAt);
        setFormattedDate(format(date, 'd MMMM yyyy, HH:mm', { locale: id }));
      } catch (err) {
        console.error('Error formatting date:', err);
        setFormattedDate('Tanggal tidak tersedia');
      }
    } else {
      setFormattedDate('Tanggal tidak tersedia');
    }
  }, [submission?.createdAt]);

  const fetchSubmission = async (id: string) => {
    setIsLoading(true);
    setError(null);
    setSubmission(null);
    setFormattedDate('Memuat tanggal...');
    try {
      const response = await fetch(`/api/submissions/${id}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setSubmission(result.submission as Submission);
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

  const getStatusBadgeColor = (status: string | undefined | null): string => {
    if (typeof status !== 'string') return 'bg-[#F0F0F0] text-gray-700';
    
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'bg-[#4CAF50] text-white'; // Green from blueprint
      case 'in progress':
        return 'bg-yellow-500 text-white'; // Yellow for in progress
      case 'pending':
        return 'bg-[#F0F0F0] text-gray-700'; // Light gray from blueprint
      default:
        return 'bg-[#F0F0F0] text-gray-700';
    }
  };

  const getStatusIcon = (status: string | undefined | null) => {
    if (typeof status !== 'string') return <HelpCircle className="h-5 w-5" />;
    
    switch (status.toLowerCase()) {
      case 'resolved':
        return <CheckCircle className="h-5 w-5" />
      case 'in progress':
        return <Timer className="h-5 w-5" />
      case 'pending':
        return <Clock className="h-5 w-5" />
      default:
        return <HelpCircle className="h-5 w-5" />
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="referenceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">ID Referensi</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="Contoh: ABC123DE" 
                      {...field} 
                      disabled={isLoading} 
                      className="pl-10 rounded-lg border-[#E0E0E0] focus-visible:ring-[#2196F3]/50"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full rounded-lg bg-[#2196F3] hover:bg-[#2196F3]/90 text-white" 
            disabled={isLoading}
          >
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

      {/* Display Submission Details or Loading/Error */}
      {(isLoading || submission || error) && (
        <div className="mt-8">
          {isLoading && (
            <div className="text-center p-6 bg-[#F0F0F0]/30 rounded-lg">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#4CAF50]" />
              <p className="mt-2 text-gray-600">Memuat detail laporan...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800">Tidak Ditemukan</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          )}

          {submission && !isLoading && !error && (
            <Card className="shadow-md border-0 rounded-lg overflow-hidden">
              <CardHeader className="pb-2 bg-white border-b border-[#F0F0F0]">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold">Laporan #{submission.referenceId}</CardTitle>
                    <CardDescription className="text-sm">
                      <span className="flex items-center mt-1">
                        <CalendarDays className="h-4 w-4 mr-1 text-gray-400" />
                        {formattedDate}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusBadgeColor(submission.status)} flex items-center gap-1 px-3 py-1.5`}>
                    {getStatusIcon(submission.status)}
                    <span>{submission.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-6">
                <div>
                  <h3 className="font-semibold text-[#4CAF50] flex items-center gap-2 mb-1">
                    <Tag className="h-4 w-4" />
                    Kategori
                  </h3>
                  <p className="text-gray-700">{submission.category}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-[#4CAF50] flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4" />
                    Deskripsi
                  </h3>
                  <p className="text-gray-700 whitespace-pre-line">{submission.description}</p>
                </div>

                {submission.fileUrl && (
                  <div>
                    <h3 className="font-semibold text-[#4CAF50] flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4" />
                      Lampiran
                    </h3>
                    <div className="mt-2">
                      <a 
                        href={submission.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#2196F3] hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        Lihat Lampiran
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                <div className="w-full text-sm text-gray-500">
                  <p>Status laporan Anda akan diperbarui setelah ditinjau oleh petugas.</p>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
