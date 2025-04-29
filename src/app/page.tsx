import SubmissionList from '@/components/submissions/submission-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { fetchSubmissions, getSubmissionStats } from '@/lib/actions/submissions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquarePlus, Activity, ArrowRight, Wrench, BookOpen, Stethoscope, HeartHandshake, Info, CheckCircle2 } from 'lucide-react';
import Script from 'next/script';

// Preload critical font
export const metadata = {
  other: {
    'google-font-preconnect': {
      url: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
  },
};

export default async function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Extract and await search parameters for filtering, sorting, searching, and pagination
  const params = await Promise.resolve({
    category: typeof searchParams?.category === 'string' ? searchParams.category : undefined,
    status: typeof searchParams?.status === 'string' ? searchParams.status : undefined,
    sortBy: typeof searchParams?.sortBy === 'string' ? searchParams.sortBy : 'date_desc', // Default sort
    search: typeof searchParams?.search === 'string' ? searchParams.search : undefined,
    page: typeof searchParams?.page === 'string' ? parseInt(searchParams.page, 10) : 1,
    limit: typeof searchParams?.limit === 'string' ? parseInt(searchParams.limit, 10) : 10 // Default items per page
  });

  // Fetch submissions based on parameters
  const { submissions, totalCount: oldTotalCount, totalPages } = await fetchSubmissions(params);

  // Fetch global stats (sinkron dengan Supabase)
  const statsResult = await getSubmissionStats();
  const stats = statsResult.success && statsResult.stats ? statsResult.stats : { total: 0, byStatus: {}, byCategory: {} };

  const categories = ['Infrastructure', 'Education', 'Health', 'Social Welfare', 'Other']; // Example categories
  const statuses = ['Pending', 'In Progress', 'Resolved'];

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

  // JSON-LD structured data for organization
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    "name": "DesaConnect - Desa Pangkalan Baru",
    "url": "https://desaconnect.id",
    "logo": "https://desaconnect.id/icons/icon-192x192.png",
    "description": "Platform aspirasi dan keluhan masyarakat untuk Desa Pangkalan Baru",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Pangkalan Baru",
      "addressRegion": "Indonesia",
      "addressCountry": "ID"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+6282112345678",
      "contactType": "customer service",
      "email": "info@desaconnect.id",
      "availableLanguage": "Indonesian"
    },
    "sameAs": [
      "https://facebook.com/desaconnect",
      "https://instagram.com/desaconnect",
      "https://twitter.com/desaconnect"
    ]
  };

  // JSON-LD structured data for WebApplication
  const applicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "DesaConnect",
    "applicationCategory": "GovernmentApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "IDR"
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Add JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationJsonLd) }}
      />
      
      {/* Hero Section - Improved for better LCP */}
      <section className="bg-[#2E7D32] text-white py-20 relative">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
                Selamat Datang di DesaConnect
              </h1>
              <p className="text-xl mb-8 text-white leading-relaxed">
                Platform aspirasi dan keluhan untuk membangun Desa Pangkalan Baru yang lebih baik.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/submit" passHref>
                  <Button size="lg" className="bg-white hover:bg-gray-100 text-[#2E7D32] font-medium rounded-lg transition-all shadow-lg hover:shadow-xl w-full sm:w-auto">
                    <MessageSquarePlus className="mr-2 h-5 w-5" /> Buat Laporan
                  </Button>
                </Link>
                <Link href="/track" passHref>
                  <Button size="lg" variant="outline" className="bg-[#0D47A1] hover:bg-[#0A3880] text-white border-white/30 hover:border-white/50 rounded-lg transition-all w-full sm:w-auto">
                    <Activity className="mr-2 h-5 w-5" /> Lacak Laporan
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl flex items-center justify-center">
                <Image 
                  src="/icons/icon-192x192.svg" 
                  alt="DesaConnect Icon" 
                  width={96} 
                  height={96} 
                  priority // Mark as priority for LCP
                  className="text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Cara Kerja - With lazy loading */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Bagaimana Cara Kerjanya?</h2>
            <p className="text-gray-600">Proses pelaporan yang mudah dan transparan untuk semua warga desa</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-gray-50">
              <div className="bg-[#2E7D32]/10 p-4 rounded-full mb-4">
                <MessageSquarePlus className="h-10 w-10 text-[#2E7D32]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Buat Laporan</h3>
              <p className="text-gray-600">Sampaikan keluhan atau aspirasi Anda dengan mudah melalui platform kami</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-gray-50">
              <div className="bg-[#0D47A1]/10 p-4 rounded-full mb-4">
                <Activity className="h-10 w-10 text-[#0D47A1]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Tindak Lanjut</h3>
              <p className="text-gray-600">Tim kami akan segera memproses dan menindaklanjuti laporan Anda</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-gray-50">
              <div className="bg-green-500/10 p-4 rounded-full mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Penyelesaian</h3>
              <p className="text-gray-600">Dapatkan update progress dan penyelesaian dari laporan Anda</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - With lazy loading of images*/}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden hover:shadow-xl transition-all">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="rounded-full bg-[#2E7D32]/10 p-3">
                  <MessageSquarePlus className="h-8 w-8 text-[#2E7D32]" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-gray-600">Total Laporan</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden hover:shadow-xl transition-all">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="rounded-full bg-[#E65100]/10 p-3">
                  <Activity className="h-8 w-8 text-[#E65100]" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.byStatus['in progress'] || 0}</p>
                  <p className="text-gray-600">Sedang Diproses</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden hover:shadow-xl transition-all">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="rounded-full bg-green-500/10 p-3">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.byStatus['resolved'] || 0}</p>
                  <p className="text-gray-600">Terselesaikan</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section - Optimized for performance */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Kategori Laporan</h2>
            <p className="text-gray-600">Pilih kategori yang sesuai dengan laporan Anda</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Link 
                key={category} 
                href={`/?category=${category}`} 
                className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 group"
              >
                <div className={`
                  ${category === 'Infrastructure' ? 'bg-blue-500/10 group-hover:bg-blue-500/20' : ''}
                  ${category === 'Education' ? 'bg-yellow-500/10 group-hover:bg-yellow-500/20' : ''}
                  ${category === 'Health' ? 'bg-red-500/10 group-hover:bg-red-500/20' : ''}
                  ${category === 'Social Welfare' ? 'bg-purple-500/10 group-hover:bg-purple-500/20' : ''}
                  ${category === 'Other' ? 'bg-gray-500/10 group-hover:bg-gray-500/20' : ''}
                  p-4 rounded-full mb-4 transition-colors
                `}>
                  {getCategoryIcon(category)}
                </div>
                <span className="font-medium text-center text-gray-900">{category}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Submissions Section - Optimized with lazy loading */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Laporan Terbaru</h2>
              <p className="text-gray-600">Lihat laporan terbaru dari masyarakat Desa Pangkalan Baru</p>
            </div>
            <Link 
              href="/submissions" 
              className="mt-4 lg:mt-0 inline-flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-[#2E7D32] font-medium rounded-lg shadow-md hover:shadow-lg transition-all border border-[#2E7D32]/20"
            >
              Lihat Semua Laporan
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="bg-gradient-to-br from-[#2E7D32]/5 to-white border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden rounded-xl">
              <CardContent className="p-6 flex items-center gap-6">
                <div className="rounded-full bg-[#2E7D32]/10 p-4">
                  <MessageSquarePlus className="h-8 w-8 text-[#2E7D32]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Buat Laporan Baru</h3>
                  <p className="text-gray-600">Sampaikan aspirasi atau keluhan Anda untuk Desa yang lebih baik</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#0D47A1]/5 to-white border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden rounded-xl">
              <CardContent className="p-6 flex items-center gap-6">
                <div className="rounded-full bg-[#0D47A1]/10 p-4">
                  <Activity className="h-8 w-8 text-[#0D47A1]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Lacak Laporan</h3>
                  <p className="text-gray-600">Pantau status dan perkembangan laporan Anda</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dynamically load SubmissionList with reduced initial priority */}
          <div className="submission-list-container">
            <SubmissionList 
              submissions={submissions}
              categories={categories}
              statuses={statuses}
              currentPage={params.page}
              totalPages={totalPages}
              totalCount={oldTotalCount}
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
    </div>
  );
}
