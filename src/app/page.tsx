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

      <section className="py-12 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Laporan Terbaru</h2>
            <p className="text-muted-foreground">Lihat laporan terbaru dari masyarakat</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-sm bg-primary/10">
                  <Megaphone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Buat Laporan Baru</h3>
                  <p className="text-sm text-muted-foreground">Sampaikan aspirasi atau keluhan Anda</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-sm bg-primary/10">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Lacak Laporan</h3>
                  <p className="text-sm text-muted-foreground">Pantau status laporan Anda</p>
                </div>
              </CardContent>
            </Card>
          </div>

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
      </section>
    </PublicLayout>
  );
}
