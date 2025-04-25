import SubmissionList from '@/components/submissions/submission-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { fetchSubmissions } from '@/lib/actions/submissions'; // Assume this action exists

// Category icons definition moved to SubmissionList component

export default async function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Extract search parameters for filtering, sorting, searching, and pagination
  const category = typeof searchParams?.category === 'string' ? searchParams.category : undefined;
  const status = typeof searchParams?.status === 'string' ? searchParams.status : undefined;
  const sortBy = typeof searchParams?.sortBy === 'string' ? searchParams.sortBy : 'date_desc'; // Default sort
  const search = typeof searchParams?.search === 'string' ? searchParams.search : undefined;
  const page = typeof searchParams?.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const limit = typeof searchParams?.limit === 'string' ? parseInt(searchParams.limit, 10) : 10; // Default items per page

  // Fetch submissions based on parameters
  const { submissions, totalCount, totalPages } = await fetchSubmissions({
    category,
    status,
    sortBy,
    search,
    page,
    limit,
    // Only fetch approved/public submissions if required by business logic
    // isPublicView: true,
  });

  const categories = ['Infrastructure', 'Education', 'Health', 'Social Welfare', 'Other']; // Example categories
  const statuses = ['Pending', 'In Progress', 'Resolved']; // Example statuses

  return (
    <div className="space-y-8">
      <Card className="shadow-lg rounded-lg overflow-hidden bg-card">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Selamat Datang di DesaConnect</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Sampaikan aspirasi dan keluhan Anda untuk Desa Pangkalan Baru yang lebih baik.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Lihat laporan yang sudah masuk, filter berdasarkan kategori atau status, atau cari laporan spesifik.</p>
        </CardContent>
      </Card>

      <Separator />

      {/* Pass fetched data and parameters to the SubmissionList component */}
      <SubmissionList
        submissions={submissions}
        categories={categories}
        statuses={statuses}
        // categoryIcons removed - now defined within SubmissionList
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        limit={limit}
        currentFilters={{ category, status, sortBy, search }}
      />
    </div>
  );
}
