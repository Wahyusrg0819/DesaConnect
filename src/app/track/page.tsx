import TrackingForm from '@/components/submissions/tracking-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSearch } from 'lucide-react';
import PublicLayout from '@/components/layout/public-layout';

export default function TrackPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Lacak Status Laporan</h1>
            <p className="text-muted-foreground">
              Masukkan ID Referensi untuk melihat status laporan Anda.
            </p>
          </div>

          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-sm bg-primary">
                  <FileSearch className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">Pelacakan Laporan</CardTitle>
                  <CardDescription>
                    Masukkan ID Referensi unik Anda
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <TrackingForm />
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Tidak memiliki ID Referensi?{' '}
            <a href="/submit" className="text-primary hover:underline">
              Buat laporan baru
            </a>.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
