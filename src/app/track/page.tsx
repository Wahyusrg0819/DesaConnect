import TrackingForm from '@/components/submissions/tracking-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSearch } from 'lucide-react';
import PublicLayout from '@/components/layout/public-layout';

export default function TrackPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Lacak Status Laporan</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Masukkan ID Referensi yang Anda terima setelah mengirimkan laporan untuk melihat status terkini.
            </p>
          </div>
          
          <Card className="shadow-lg rounded-lg overflow-hidden border-0">
            <CardHeader className="bg-[#F0F0F0] border-b border-[#E0E0E0]">
              <div className="flex items-center gap-3">
                <div className="bg-[#4CAF50] p-2 rounded-lg">
                  <FileSearch className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800">Pelacakan Laporan</CardTitle>
                  <CardDescription className="text-gray-600">
                    Track laporan Anda dengan ID Referensi unik
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <TrackingForm />
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center text-gray-600 text-sm">
            <p>Tidak memiliki ID Referensi? <a href="/submit" className="text-[#2196F3] hover:underline">Buat laporan baru</a> dan Anda akan mendapatkan ID Referensi unik.</p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
