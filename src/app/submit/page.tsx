import SubmissionForm from '@/components/submissions/submission-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubmitPage() {
  const categories = ['Infrastructure', 'Education', 'Health', 'Social Welfare', 'Other']; // Example categories

  return (
    <Card className="max-w-2xl mx-auto shadow-lg rounded-lg overflow-hidden bg-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">Buat Laporan Baru</CardTitle>
        <CardDescription className="text-muted-foreground">
          Sampaikan aspirasi atau keluhan Anda di sini. Mohon isi form di bawah ini dengan lengkap.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SubmissionForm categories={categories} />
      </CardContent>
    </Card>
  );
}
