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
// import { getSubmissionByReferenceId } from "@/lib/actions/submissions"; // Removed server action import
// import type { Submission } from '@/lib/types'; // Removed type import
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useSearchParams } from 'next/navigation';

// Define a type based on the expected API response structure (matching Mongoose model)
interface SubmissionData {
  _id: string;
  name?: string;
  contactInfo?: string;
  category: string;
  description: string;
  createdAt: string;
  referenceId: string;
  status?: 'pending' | 'in progress' | 'resolved'; // status can be optional
  fileUrl?: string;
}

const formSchema = z.object({
  referenceId: z.string().min(1, { message: "ID Referensi tidak boleh kosong." })
    // Adjust regex based on your generated ID format (currently 8 alphanumeric chars)
    .regex(/^[A-Z0-9]{8}$/, { message: "Format ID Referensi tidak valid (contoh: ABC123DE)." }),
});

type TrackingFormValues = z.infer<typeof formSchema>;

export default function TrackingForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || ''; // Get ID from URL param if present

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
         // The API route returns the submission object directly on success
        setSubmission(result as SubmissionData);
      } else {
        // Handle errors from the API route (e.g., 404 not found)
        setError(result.message || "Laporan tidak ditemukan.");
        setSubmission(null); // Ensure submission is cleared on error
         toast({
           title: "Laporan Tidak Ditemukan",
           description: result.message || `Laporan dengan ID ${id} tidak ditemukan.`,
           variant: "destructive",
         });
      }
    } catch (err: any) {
      setError("Gagal mengambil data laporan. Coba lagi nanti.");
      setSubmission(null); // Ensure submission is cleared on error
       toast({
        title: "Terjadi Kesalahan",
        description: err.message || "Tidak dapat menghubungi server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

   // Fetch submission if ID is present in URL on initial load
  React.useEffect(() => {
    if (initialId) {
      // Validate initialId format before fetching
      const validation = formSchema.safeParse({ referenceId: initialId });
      if (validation.success) {
        fetchSubmission(initialId);
      } else {
         setError("Format ID Referensi di URL tidak valid.");
         form.reset({ referenceId: '' }); // Clear invalid ID from form
          toast({
            title: "ID Referensi Tidak Valid",
            description: "Format ID Referensi di URL tidak sesuai.",
            variant: "destructive",
          });
      }
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]); // Only run on initial load based on initialId

  async function onSubmit(values: TrackingFormValues) {
    fetchSubmission(values.referenceId);
  }

   const getStatusBadgeVariant = (status: string | undefined | null): "default" | "secondary" | "destructive" | "outline" => {
        // Add check if status is a string before calling toLowerCase()
        if (typeof status !== 'string') return 'outline';
        switch (status.toLowerCase()) {
        case 'resolved':
            return 'default'; // Green (using primary color via theme)
        case 'in progress':
            return 'secondary'; // Use theme's secondary
        case 'pending':
            return 'outline'; // Neutral outline
        default:
            return 'outline';
        }
    };

    const getStatusTextColor = (status: string | undefined | null): string => {
        // Add check if status is a string before calling toLowerCase()
        if (typeof status !== 'string') return 'text-muted-foreground';
        switch (status.toLowerCase()) {
        case 'resolved':
            return 'text-primary'; // Green text
        case 'in progress':
            return 'text-yellow-600 dark:text-yellow-400'; // Example: Yellowish text
        case 'pending':
            return 'text-muted-foreground'; // Gray text
        default:
            return 'text-muted-foreground';
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

      {/* Display Submission Details */}
      {isLoading && (
         <div className="text-center p-6">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Memuat detail laporan...</p>
         </div>
      )}

       {error && !isLoading && (
         <Card className="border-destructive bg-destructive/10">
            <CardContent className="p-4 flex items-center gap-3">
                 <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
                 <p className="text-sm text-destructive font-medium">{error}</p>
            </CardContent>
         </Card>
       )}


      {submission && !isLoading && !error && (
        <Card className="mt-6 shadow-md rounded-lg border border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary">Detail Laporan #{submission.referenceId}</CardTitle>
            <CardDescription>Status terakhir laporan Anda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {/* Optional: Display Name and Contact Info if available */}
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
               {/* Ensure createdAt is treated as a Date object */}
               <span>{format(new Date(submission.createdAt), 'dd MMMM yyyy, HH:mm', { locale: id })}</span>
            </div>
             <div className="flex items-start gap-2">
               <FileText className="h-4 w-4 text-muted-foreground mt-1" />
               <span className="font-medium">Deskripsi:</span>
               <p className="text-muted-foreground">{submission.description}</p>
            </div>
             {/* Display file link only if fileUrl exists */}
             {submission.fileUrl && (
                <div className="flex items-center gap-2">
                     <span className="font-medium">Lampiran:</span>
                     <Button variant="link" size="sm" asChild className="p-0 h-auto text-accent hover:text-accent/80">
                        <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">Lihat File</a>
                    </Button>
                </div>
             )}

          </CardContent>
           {/* Display status using the status field from the fetched data */}
           <CardFooter className="bg-secondary/50 p-4 rounded-b-lg flex justify-between items-center">
                <span className="font-medium text-foreground">Status Saat Ini:</span>
                <Badge variant={getStatusBadgeVariant(submission.status)} className={`capitalize text-base px-3 py-1 ${getStatusTextColor(submission.status)}`}>
                    {submission.status}
                </Badge>
           </CardFooter>
        </Card>
      )}
    </div>
  );
}
