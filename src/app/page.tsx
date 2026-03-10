import SubmissionList from '@/components/submissions/submission-list';
import { Card, CardContent } from "@/components/ui/card";
import { fetchSubmissions, getSubmissionStats } from '@/lib/actions/submissions';
import { Megaphone, Activity } from 'lucide-react';
import PublicLayout from '@/components/layout/public-layout';
import { Hero } from '@/components/ui/hero';
import { HowItWorks } from '@/components/ui/how-it-works';
import { Stats } from '@/components/ui/stats';

import { CATEGORIES } from '@/lib/constants';

export const metadata = {
  title: 'Desa Pangkalan Baru - Platform Aspirasi Masyarakat',
  description: 'Platform aspirasi dan keluhan masyarakat untuk kemajuan Desa Pangkalan Baru',
};

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const awaitedSearchParams = await searchParams ?? {};

  const category = typeof awaitedSearchParams.category === 'string'
    ? awaitedSearchParams.category
    : undefined;

  const status = typeof awaitedSearchParams.status === 'string'
    ? awaitedSearchParams.status
    : undefined;

  const sortBy = typeof awaitedSearchParams.sortBy === 'string'
    ? awaitedSearchParams.sortBy
    : 'date_desc';

  const search = typeof awaitedSearchParams.search === 'string'
    ? awaitedSearchParams.search
    : undefined;

  const page = typeof awaitedSearchParams.page === 'string'
    ? parseInt(awaitedSearchParams.page, 10)
    : 1;

  const limit = typeof awaitedSearchParams.limit === 'string'
    ? parseInt(awaitedSearchParams.limit, 10)
    : 10;

  const params = {
    category,
    status,
    sortBy,
    search,
    page,
    limit
  };

  const { submissions, totalCount, totalPages } = await fetchSubmissions(params);

  const statsResult = await getSubmissionStats();
  const stats = statsResult.success && statsResult.stats
    ? statsResult.stats
    : { total: 0, byStatus: {}, byCategory: {} };

  const categories = [...CATEGORIES];
  const statuses = ['Menunggu', 'Diproses', 'Selesai'];

  return (
    <PublicLayout>
      <Hero
        title="Selamat Datang di Desa Pangkalan Baru"
        subtitle="Platform aspirasi dan keluhan untuk membangun desa yang lebih baik"
        badge="Platform Digital Desa"
        actions={[
          { label: "Buat Laporan", href: "/submit", variant: "default" },
          { label: "Lacak Laporan", href: "/track", variant: "outline" }
        ]}
      />

      <HowItWorks />

      <Stats
        total={stats.total}
        processing={stats.byStatus['in progress'] || 0}
        completed={stats.byStatus['resolved'] || 0}
      />

      <section className="py-20 bg-background relative border-t border-border/50">
        <div className="absolute inset-0 bg-secondary/20 -z-10"></div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="mb-12">
            <h2 className="text-3xl font-extrabold mb-3 tracking-tight">Laporan & Aspirasi Terbaru</h2>
            <p className="text-muted-foreground text-lg">Lihat laporan dan aspirasi yang telah disampaikan oleh masyarakat beserta status penyelesaiannya.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="border-border/60 bg-gradient-to-br from-card to-primary/5 shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-colors"></div>
              <CardContent className="p-8 flex items-center gap-6 relative z-10">
                <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                  <Megaphone className="h-8 w-8 text-primary group-hover:text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1.5">Buat Laporan Baru</h3>
                  <p className="text-muted-foreground leading-relaxed">Sampaikan aspirasi atau keluhan Anda kepada perangkat desa dengan mudah dan aman.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-gradient-to-bl from-card to-accent/5 shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-accent/10 rounded-full blur-xl group-hover:bg-accent/20 transition-colors"></div>
              <CardContent className="p-8 flex items-center gap-6 relative z-10">
                <div className="p-4 rounded-2xl bg-accent/20 group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300 shadow-sm">
                  <Activity className="h-8 w-8 text-accent-foreground group-hover:text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1.5">Lacak Status Laporan</h3>
                  <p className="text-muted-foreground leading-relaxed">Gunakan kode referensi yang Anda miliki untuk mengetahui status tindak lanjut.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm p-2 sm:p-4">
            <SubmissionList
              submissions={submissions}
              categories={categories}
              statuses={statuses}
              currentPage={params.page}
              totalPages={totalPages}
              totalCount={totalCount}
              limit={params.limit}
              currentFilters={{
                category: params.category,
                status: params.status,
                sortBy: params.sortBy,
                search: params.search
              }}
            />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
