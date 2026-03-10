import SubmissionForm from '@/components/submissions/submission-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquarePlus } from 'lucide-react';
import PublicLayout from '@/components/layout/public-layout';

import { CATEGORIES } from '@/lib/constants';

export default function SubmitPage() {
  const categories = [...CATEGORIES];

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Buat Laporan Baru</h1>
            <p className="text-muted-foreground">
              Sampaikan aspirasi atau keluhan Anda untuk Desa Pangkalan Baru.
            </p>
          </div>

          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-sm bg-primary">
                  <MessageSquarePlus className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">Form Laporan</CardTitle>
                  <CardDescription>
                    Sampaikan aspirasi atau keluhan Anda
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <SubmissionForm categories={categories} />
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Sudah memiliki ID Referensi?{' '}
            <a href="/track" className="text-primary hover:underline">
              Lacak status laporan Anda
            </a>.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
