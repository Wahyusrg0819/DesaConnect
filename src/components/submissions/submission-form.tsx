"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
// import { createSubmission } from "@/lib/actions/submissions"; // Removed server action import
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Define validation schema
const formSchema = z.object({
  name: z.string().optional(),
  contactInfo: z.string().optional(),
  category: z.string({
    required_error: "Kategori harus dipilih.",
  }),
  description: z.string().min(10, {
    message: "Deskripsi minimal harus 10 karakter.",
  }).max(1000, {
    message: "Deskripsi maksimal 1000 karakter."
  }),
  // File upload is handled separately, not directly in form data for this example
});

type SubmissionFormValues = z.infer<typeof formSchema>;

interface SubmissionFormProps {
  categories: string[];
}

export default function SubmissionForm({ categories }: SubmissionFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);

  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contactInfo: "",
      category: "",
      description: "",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      // Basic file validation (e.g., size, type) - add more robust validation if needed
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
          toast({
              title: "Ukuran File Terlalu Besar",
              description: "Ukuran file maksimal adalah 5MB.",
              variant: "destructive",
          });
          setFile(null);
          event.target.value = ''; // Clear the input
          return;
      }
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  async function onSubmit(values: SubmissionFormValues) {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', values.name || '');
    formData.append('contactInfo', values.contactInfo || '');
    formData.append('category', values.category);
    formData.append('description', values.description);
    if (file) {
      formData.append('file', file);
    }

    try {
      // Use fetch API to send data to the new API route
      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success && result.referenceId) {
        toast({
          title: "Laporan Berhasil Dikirim",
          description: `ID Referensi Anda: ${result.referenceId}. Silakan simpan ID ini untuk melacak status laporan Anda.`,
          variant: "default",
          duration: 10000,
        });
        form.reset();
        setFile(null);
        router.push(`/track?id=${result.referenceId}`);
      } else {
        // Handle API errors
        throw new Error(result.message || "Gagal mengirim laporan.");
      }
    } catch (error: any) {
      toast({
        title: "Gagal Mengirim Laporan",
        description: error.message || "Terjadi kesalahan yang tidak diketahui.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama (Opsional)</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama Anda" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormDescription>
                Nama Anda tidak akan ditampilkan secara publik jika tidak diizinkan.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Info Kontak (Opsional - Email/Telepon)</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan email atau nomor telepon" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormDescription>
                Kami akan menggunakan ini untuk menghubungi Anda jika perlu informasi lebih lanjut (tidak akan dipublikasikan).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori laporan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi Laporan *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Jelaskan aspirasi atau keluhan Anda secara detail..."
                  className="resize-y min-h-[100px]"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
               <FormDescription>
                Berikan detail yang jelas agar kami dapat memahami dan menindaklanjuti laporan Anda.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

         <FormItem>
              <FormLabel>Lampiran (Opsional - Foto/Dokumen)</FormLabel>
              <FormControl>
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                    accept="image/*,application/pdf,.doc,.docx" // Specify acceptable file types
                  />
              </FormControl>
              <FormDescription>
                Unggah file pendukung jika ada (maks. 5MB). Format: JPG, PNG, PDF, DOC, DOCX.
              </FormDescription>
              <FormMessage />
          </FormItem>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mengirim...
            </>
          ) : (
            'Kirim Laporan'
          )}
        </Button>
      </form>
    </Form>
  );
}
