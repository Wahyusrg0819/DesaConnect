import SubmissionList from '@/components/submissions/submission-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { fetchSubmissions } from '@/lib/actions/submissions'; // Assume this action exists

// Define category icons (replace with actual icons if possible)
const categoryIcons: Record<string, React.ElementType> = {
  Infrastructure: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wrench"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>, // Wrench
  Education: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>, // BookOpen
  Health: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-stethoscope"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>, // Stethoscope
  'Social Welfare': () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart-handshake"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/><path d="m18 15-2-2"/><path d="m15 18-2-2"/></svg>, // HeartHandshake
  Other: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>, // Info
};

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

  // Fetch submissions based on parameters (replace with actual API call/data fetching logic)
  // This fetchSubmissions function needs to be implemented in lib/actions/submissions.ts
  // It should handle filtering, sorting, searching, and pagination based on the arguments.
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
        categoryIcons={categoryIcons}
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        limit={limit}
        currentFilters={{ category, status, sortBy, search }}
      />
    </div>
  );
}
