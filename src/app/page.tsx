import SubmissionList from '@/components/submissions/submission-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { fetchSubmissions } from '@/lib/actions/submissions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MessageSquarePlus, Activity, ArrowRight, Wrench, BookOpen, Stethoscope, HeartHandshake, Info, CheckCircle2 } from 'lucide-react';

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
  });

  const categories = ['Infrastructure', 'Education', 'Health', 'Social Welfare', 'Other']; // Example categories
  const statuses = ['Pending', 'In Progress', 'Resolved']; // Example statuses

  // Category icons mapping based on blueprint
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Infrastructure': return <Wrench className="h-6 w-6" />;
      case 'Education': return <BookOpen className="h-6 w-6" />;
      case 'Health': return <Stethoscope className="h-6 w-6" />;
      case 'Social Welfare': return <HeartHandshake className="h-6 w-6" />;
      default: return <Info className="h-6 w-6" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Lebih simpel */}
      <section className="bg-[#4CAF50] text-white py-14 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Selamat Datang di DesaConnect</h1>
              <p className="text-lg mb-8 text-white">
                Platform aspirasi dan keluhan untuk Desa Pangkalan Baru.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/submit" passHref>
                  <Button size="lg" className="bg-[#2196F3] hover:bg-[#1976D2] text-white rounded-lg transition-colors shadow-md">
                    <MessageSquarePlus className="mr-2 h-5 w-5" /> Buat Laporan Baru
                  </Button>
                </Link>
                <Link href="/track" passHref>
                  <Button size="lg" variant="secondary" className="bg-white text-[#4CAF50] hover:bg-gray-100 rounded-lg transition-colors shadow-md">
                    <Activity className="mr-2 h-5 w-5" /> Lacak Laporan
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="bg-white rounded-full p-5 shadow-md">
                <MessageSquarePlus className="text-[#4CAF50] h-20 w-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Cara Kerja - Lebih simpel */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Bagaimana Cara Kerjanya?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-5">
              <div className="bg-[#4CAF50]/10 p-3 rounded-full mb-3">
                <MessageSquarePlus className="h-8 w-8 text-[#4CAF50]" />
              </div>
              <h3 className="text-lg font-semibold mb-1">1. Buat Laporan</h3>
              <p className="text-gray-600 text-sm">Sampaikan keluhan atau aspirasi Anda</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-5">
              <div className="bg-[#2196F3]/10 p-3 rounded-full mb-3">
                <Activity className="h-8 w-8 text-[#2196F3]" />
              </div>
              <h3 className="text-lg font-semibold mb-1">2. Tindak Lanjut</h3>
              <p className="text-gray-600 text-sm">Petugas memproses laporan Anda</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-5">
              <div className="bg-green-500/10 p-3 rounded-full mb-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-1">3. Penyelesaian</h3>
              <p className="text-gray-600 text-sm">Laporan Anda diselesaikan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Lebih simpel */}
      <section className="py-10 bg-[#F0F0F0]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="bg-white shadow-md border-0 rounded-lg overflow-hidden">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="rounded-full bg-[#4CAF50]/10 p-2">
                  <MessageSquarePlus className="h-6 w-6 text-[#4CAF50]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{totalCount}</p>
                  <p className="text-gray-500 text-sm">Total Laporan</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-md border-0 rounded-lg overflow-hidden">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="rounded-full bg-yellow-500/10 p-2">
                  <Activity className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{submissions.filter(s => s.status === 'In Progress').length}</p>
                  <p className="text-gray-500 text-sm">Sedang Diproses</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-md border-0 rounded-lg overflow-hidden">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="rounded-full bg-green-500/10 p-2">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{submissions.filter(s => s.status === 'Resolved').length}</p>
                  <p className="text-gray-500 text-sm">Terselesaikan</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Preview Section - Lebih simpel */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Kategori Laporan</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link 
                key={category} 
                href={`/?category=${category}`} 
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100"
              >
                <div className={`
                  ${category === 'Infrastructure' ? 'bg-blue-500/10' : ''}
                  ${category === 'Education' ? 'bg-yellow-500/10' : ''}
                  ${category === 'Health' ? 'bg-red-500/10' : ''}
                  ${category === 'Social Welfare' ? 'bg-purple-500/10' : ''}
                  ${category === 'Other' ? 'bg-gray-500/10' : ''}
                  p-3 rounded-full mb-2
                `}>
                  {getCategoryIcon(category)}
                </div>
                <span className="font-medium text-center text-sm text-gray-800">{category}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Submissions Section */}
      <section className="py-12 bg-[#F0F0F0]">
        <div className="container mx-auto px-4"> 
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Laporan Terbaru</h2>
              <p className="text-gray-600">Lihat laporan terbaru dari masyarakat Desa Pangkalan Baru</p>
            </div>
            <Link href="/submissions" className="mt-3 md:mt-0 inline-flex items-center px-4 py-2 bg-white hover:bg-gray-50 text-[#2196F3] rounded-lg shadow-sm transition-colors border border-[#2196F3]/20">
              Lihat Semua 
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
          
          {/* Custom section header cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-[#4CAF50]/10 to-white border-0 shadow-sm overflow-hidden">
              <CardContent className="p-5 flex items-center">
                <div className="rounded-full bg-[#4CAF50]/20 p-3 mr-4">
                  <MessageSquarePlus className="h-6 w-6 text-[#4CAF50]" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Buat Laporan</h4>
                  <p className="text-sm text-gray-600">Ajukan laporan Anda</p>
                </div>
                <div className="ml-auto">
                  <Link href="/submit">
                    <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-[#2196F3]/10 to-white border-0 shadow-sm overflow-hidden">
              <CardContent className="p-5 flex items-center">
                <div className="rounded-full bg-[#2196F3]/20 p-3 mr-4">
                  <Activity className="h-6 w-6 text-[#2196F3]" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Lacak Laporan</h4>
                  <p className="text-sm text-gray-600">Pantau status laporan</p>
                </div>
                <div className="ml-auto">
                  <Link href="/track">
                    <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pass fetched data and parameters to the SubmissionList component */}
          <div className="bg-white p-5 rounded-lg shadow-md">
            <SubmissionList
              submissions={submissions}
              categories={categories}
              statuses={statuses}
              currentPage={page}
              totalPages={totalPages}
              totalCount={totalCount}
              limit={limit}
              currentFilters={{ category, status, sortBy, search }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
