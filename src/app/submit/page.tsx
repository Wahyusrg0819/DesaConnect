import SubmissionForm from '@/components/submissions/submission-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquarePlus } from 'lucide-react';
import PublicLayout from '@/components/layout/public-layout';

export default function SubmitPage() {
  const categories = ['Infrastruktur', 'Pendidikan', 'Kesehatan', 'Kesejahteraan Sosial', 'Lainnya']; // Kategori laporan

  return (
    <PublicLayout>
      <div className="container mx-auto px-3 md:px-4 py-8 md:py-12 bg-gradient-to-br from-[#e8f5e9] via-[#f0f4c3] to-[#f0f0f0] min-h-screen rounded-lg md:rounded-2xl shadow-xl">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6 md:mb-10 px-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-3 md:mb-4 text-gray-800 tracking-tight drop-shadow-sm">
              Buat Laporan Baru
            </h1>
            <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Sampaikan aspirasi atau keluhan Anda untuk Desa Pangkalan Baru. Isi formulir dengan lengkap agar kami dapat menindaklanjuti.
            </p>
          </div>
          <Card className="shadow-2xl rounded-xl md:rounded-2xl overflow-hidden border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-[#F0F0F0] border-b border-[#E0E0E0] py-4 md:py-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="bg-[#4CAF50] p-2 md:p-3 rounded-lg md:rounded-xl shadow-md flex-shrink-0">
                  <MessageSquarePlus className="h-5 w-5 md:h-7 md:w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg md:text-2xl font-bold text-gray-800 truncate">Form Laporan</CardTitle>
                  <CardDescription className="text-xs md:text-base text-gray-600">
                    Sampaikan aspirasi atau keluhan Anda
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-8">
              <SubmissionForm categories={categories} />
            </CardContent>
          </Card>
          <div className="mt-6 md:mt-10 text-center text-gray-600 text-xs md:text-sm px-4">
            <p>
              Sudah memiliki ID Referensi?{' '}
              <a href="/track" className="text-[#2196F3] hover:underline font-semibold transition-colors duration-150">
                Lacak status laporan Anda
              </a>.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
