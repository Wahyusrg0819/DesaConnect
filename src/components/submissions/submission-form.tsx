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
import { createSubmission } from "@/lib/actions/submissions";
import { useRouter } from 'next/navigation';
import { Loader2, User, Phone, FileText, Send, Upload, Tag, MessageSquare, AlignLeft } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

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
  const [activeStep, setActiveStep] = React.useState(1);
  const [formProgress, setFormProgress] = React.useState(25);

  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contactInfo: "",
      category: "",
      description: "",
    },
    mode: "onChange"
  });

  React.useEffect(() => {
    // Update progress based on form completion
    const values = form.getValues();
    let completedFields = 0;
    
    if (values.category) completedFields++;
    if (values.description && values.description.length >= 10) completedFields++;
    if (values.name) completedFields++;
    if (values.contactInfo) completedFields++;
    if (file) completedFields++;

    // Calculate progress (considering name and contactInfo as optional)
    const requiredFields = 2; // category and description
    const optionalFields = 3; // name, contactInfo, and file
    
    const progress = Math.min(
      100,
      Math.floor((completedFields / (requiredFields + optionalFields)) * 100)
    );
    
    setFormProgress(progress < 25 ? 25 : progress);
  }, [form.watch(), file]);

  const nextStep = () => {
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      // Basic file validation (e.g., size, type)
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
      // Menggunakan server action Supabase langsung
      const result = await createSubmission(formData);

      if (result.success && result.referenceId) {
        toast({
          title: "Laporan Berhasil Dikirim",
          description: `ID Referensi Anda: ${result.referenceId}. Silakan simpan ID ini untuk melacak status laporan Anda.`,
          variant: "default",
          duration: 10000,
        });
        form.reset();
        setFile(null);
        setActiveStep(1);
        router.push(`/track?id=${result.referenceId}`);
      } else {
        // Handle API errors
        throw new Error(result.error || "Gagal mengirim laporan.");
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
    <Card className="w-full max-w-2xl mx-auto shadow-2xl border-0 rounded-xl md:rounded-2xl bg-white/90 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-[#4CAF50]/90 to-[#2E7D32] text-white rounded-t-xl md:rounded-t-2xl pb-4 md:pb-6 shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg md:text-2xl font-extrabold tracking-tight drop-shadow-sm">Formulir Laporan Baru</CardTitle>
            <CardDescription className="text-white/90 mt-1 font-medium text-sm md:text-base">
              Sampaikan aspirasi atau keluhan Anda untuk Desa Pangkalan Baru
            </CardDescription>
          </div>
        </div>
        <div className="mt-3 md:mt-4">
          <Progress value={formProgress} className="h-2 bg-white/30 rounded-full" />
          <div className="flex justify-between mt-2 text-xs md:text-sm text-white/90">
            <div className={`font-semibold ${activeStep === 1 ? "text-white" : "opacity-80"} text-center flex-1`}>
              <span className="hidden sm:inline">Informasi Dasar</span>
              <span className="sm:hidden">Info</span>
            </div>
            <div className={`font-semibold ${activeStep === 2 ? "text-white" : "opacity-80"} text-center flex-1`}>
              <span className="hidden sm:inline">Detail Laporan</span>
              <span className="sm:hidden">Detail</span>
            </div>
            <div className={`font-semibold ${activeStep === 3 ? "text-white" : "opacity-80"} text-center flex-1`}>
              <span className="hidden sm:inline">Lampiran & Kirim</span>
              <span className="sm:hidden">Kirim</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Basic Information */}
            {activeStep === 1 && (
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <User className="h-4 w-4 md:h-5 md:w-5 text-[#4CAF50]" />
                  <h3 className="text-base md:text-lg font-bold text-gray-800">Informasi Dasar</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium text-sm md:text-base">
                          Nama (Opsional)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Masukkan nama Anda" 
                            {...field} 
                            disabled={isSubmitting} 
                            className="border-gray-300 focus:border-[#4CAF50] focus:ring-[#4CAF50] rounded-md text-sm md:text-base"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500 text-xs md:text-sm">
                          Nama Anda tidak akan ditampilkan secara publik.
                        </FormDescription>
                        <FormMessage className="text-red-500 text-xs md:text-sm" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contactInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium text-sm md:text-base">
                          Kontak WhatsApp (Opsional)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Nomor WhatsApp atau email" 
                            {...field} 
                            disabled={isSubmitting} 
                            className="border-gray-300 focus:border-[#4CAF50] focus:ring-[#4CAF50] rounded-md text-sm md:text-base"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500 text-xs md:text-sm">
                          Untuk menghubungi Anda jika diperlukan.
                        </FormDescription>
                        <FormMessage className="text-red-500 text-xs md:text-sm" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium flex items-center gap-2 text-sm md:text-base">
                        <Tag className="h-4 w-4 text-[#4CAF50]" />
                        Kategori Laporan *
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger className="border-gray-300 focus:border-[#4CAF50] focus:ring-[#4CAF50] rounded-md text-sm md:text-base">
                            <SelectValue placeholder="Pilih kategori laporan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border border-gray-200 rounded-md shadow-md">
                          {categories.map((category) => (
                            <SelectItem key={category} value={category} className="text-sm md:text-base">
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500 text-xs md:text-sm" />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {/* Step 2: Report Details */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5 text-[#4CAF50]" />
                  <h3 className="text-lg font-bold text-gray-800">Detail Laporan</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium flex items-center gap-2 text-sm md:text-base">
                        <AlignLeft className="h-4 w-4 text-[#4CAF50]" />
                        Deskripsi Laporan *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Jelaskan aspirasi atau keluhan Anda secara detail..."
                          className="resize-y min-h-[150px] md:min-h-[200px] border-gray-300 focus:border-[#4CAF50] focus:ring-[#4CAF50] rounded-md text-sm md:text-base"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center mt-1">
                        <FormDescription className="text-gray-500 text-xs md:text-sm">
                          Berikan detail yang jelas (min. 10 karakter).
                        </FormDescription>
                        <div className="text-xs md:text-sm text-gray-500">
                          {field.value.length}/1000
                        </div>
                      </div>
                      <FormMessage className="text-red-500 text-xs md:text-sm" />
                    </FormItem>
                  )}
                />
                
                <Accordion type="single" collapsible className="mt-4">
                  <AccordionItem value="tips" className="border rounded-lg md:rounded-xl px-3 md:px-6 bg-[#f0f4c3]/40">
                    <AccordionTrigger className="text-[#4CAF50] hover:text-[#3d8b40] font-semibold py-2 text-sm md:text-base">
                      Tips Menulis Laporan Yang Baik
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-4 md:pl-5 text-xs md:text-sm text-gray-700 space-y-1">
                        <li>Berikan informasi spesifik: lokasi, waktu, dan situasi dengan jelas</li>
                        <li>Sampaikan fakta yang terjadi, hindari opini atau prasangka</li>
                        <li>Jelaskan dampak yang terjadi atau dikhawatirkan</li>
                        <li>Usulkan solusi jika Anda memiliki ide untuk perbaikan</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
            
            {/* Step 3: Attachment & Submit */}
            {activeStep === 3 && (
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <Upload className="h-4 w-4 md:h-5 md:w-5 text-[#4CAF50]" />
                  <h3 className="text-base md:text-lg font-bold text-gray-800">Lampiran & Kirim</h3>
                </div>
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold text-sm md:text-base">
                    Lampiran (Opsional)
                  </FormLabel>
                  <div className="mt-1">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-28 md:h-36 border-2 border-gray-300 border-dashed rounded-lg md:rounded-2xl cursor-pointer bg-[#F0F0F0] hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-3 pb-4 md:pt-5 md:pb-6">
                          <Upload className="w-6 h-6 md:w-8 md:h-8 mb-2 md:mb-3 text-gray-500" />
                          <p className="mb-1 md:mb-2 text-xs md:text-sm text-gray-500 text-center px-2">
                            <span className="font-semibold">Klik untuk unggah</span> atau seret dan lepas
                          </p>
                          <p className="text-xs text-gray-500 text-center px-2">
                            Format: JPG, PNG, PDF, DOC, DOCX (Maks. 5MB)
                          </p>
                        </div>
                        <Input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={isSubmitting}
                          accept="image/*,application/pdf,.doc,.docx"
                        />
                      </label>
                    </div>
                  </div>
                  {file && (
                    <div className="mt-2 flex items-center gap-2 p-2 bg-[#e8f5e9] rounded-lg md:rounded-xl text-xs md:text-sm text-gray-700">
                      <FileText className="h-4 w-4 text-[#4CAF50] flex-shrink-0" />
                      <span className="font-semibold">File terpilih:</span>
                      <span className="truncate">{file.name}</span>
                    </div>
                  )}
                  <FormDescription className="text-gray-500 text-xs md:text-sm mt-2">
                    Unggah file pendukung jika ada (maks. 5MB).
                  </FormDescription>
                </FormItem>
                <div className="mt-4 md:mt-6 border-t pt-3 md:pt-4">
                  <div className="bg-[#e8f5e9] rounded-lg md:rounded-xl p-3 md:p-4 mb-3 md:mb-4 text-xs md:text-sm text-gray-700">
                    <p>Dengan mengirimkan formulir ini, Anda menyetujui bahwa laporan Anda akan ditindaklanjuti oleh petugas desa. Pastikan informasi yang disampaikan adalah benar dan dapat dipertanggungjawabkan.</p>
                  </div>
                </div>
              </div>
            )}
            
          </form>
        </Form>
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 md:px-8 py-4 md:py-6 flex flex-col sm:flex-row justify-between gap-3 md:gap-4 rounded-b-lg md:rounded-b-2xl">
        {activeStep > 1 && (
          <Button 
            type="button" 
            onClick={prevStep} 
            variant="outline"
            disabled={isSubmitting}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold text-sm md:text-base"
          >
            Kembali
          </Button>
        )}
        <div className={`flex ${activeStep === 1 ? 'justify-end w-full' : 'justify-end'}`}>
          {activeStep < 3 ? (
            <Button 
              type="button" 
              onClick={nextStep} 
              className="bg-[#4CAF50] hover:bg-[#3d8b40] text-white font-semibold shadow-md text-sm md:text-base"
              disabled={activeStep === 2 && !form.getValues('description')}
            >
              Lanjut
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={form.handleSubmit(onSubmit)} 
              disabled={isSubmitting} 
              className="bg-[#4CAF50] hover:bg-[#3d8b40] text-white font-semibold shadow-md text-sm md:text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Kirim Laporan
                </>
              )}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
