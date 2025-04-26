import SubmissionForm from '@/components/submissions/submission-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquarePlus } from 'lucide-react';

export default function SubmitPage() {
  const categories = ['Infrastructure', 'Education', 'Health', 'Social Welfare', 'Other']; // Example categories

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Buat Laporan Baru</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sampaikan aspirasi atau keluhan Anda untuk Desa Pangkalan Baru. Isi formulir dengan lengkap agar kami dapat menindaklanjuti.
          </p>
        </div>
        
        <Card className="shadow-lg rounded-lg overflow-hidden border-0">
          <CardHeader className="bg-[#F0F0F0] border-b border-[#E0E0E0]">
            <div className="flex items-center gap-3">
              <div className="bg-[#4CAF50] p-2 rounded-lg">
                <MessageSquarePlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">Form Laporan</CardTitle>
                <CardDescription className="text-gray-600">
                  Sampaikan aspirasi atau keluhan Anda
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <SubmissionForm categories={categories} />
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Sudah memiliki ID Referensi? <a href="/track" className="text-[#2196F3] hover:underline">Lacak status laporan Anda</a>.</p>
        </div>
      </div>
    </div>
  );
}
