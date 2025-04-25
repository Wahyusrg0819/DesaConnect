import TrackingForm from '@/components/submissions/tracking-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TrackPage() {
  return (
    <Card className="max-w-md mx-auto shadow-lg rounded-lg overflow-hidden bg-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">Lacak Status Laporan Anda</CardTitle>
        <CardDescription className="text-muted-foreground">
          Masukkan ID Referensi unik yang Anda terima setelah mengirimkan laporan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TrackingForm />
      </CardContent>
    </Card>
  );
}
