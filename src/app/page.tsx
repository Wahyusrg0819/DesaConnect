import SubmissionList from '@/components/submissions/submission-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { fetchSubmissions, getSubmissionStats } from '@/lib/actions/submissions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquarePlus, Activity, ArrowRight, Wrench, BookOpen, Stethoscope, HeartHandshake, Info, CheckCircle2 } from 'lucide-react';
import { Users, Building, HomeIcon, FileText, ClipboardList, Megaphone } from 'lucide-react';
import Script from 'next/script';
import PublicLayout from '@/components/layout/public-layout';
import { Hero } from '@/components/ui/hero';
import { HowItWorks } from '@/components/ui/how-it-works';
import { Stats } from '@/components/ui/stats';

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
  // Create a properly awaited searchParams object
  const awaitedSearchParams = await Promise.resolve(searchParams || {});
  
  // Extract parameters after awaiting
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

  // Create params object after individual extraction
  const params = {
    category,
    status,
    sortBy,
    search,
    page,
    limit
  };

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
    <PublicLayout>
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
        
        {/* Hero Section - Modern and Animated */}
        <Hero 
          title="Selamat Datang di DesaConnect"
          subtitle="Platform aspirasi dan keluhan untuk membangun Desa Pangkalan Baru yang lebih baik."
          badge="Platform Digital Desa"
          actions={[
            {
              label: "Buat Laporan",
              href: "/submit",
              variant: "default"
            },
            {
              label: "Lacak Laporan",
              href: "/track",
              variant: "outline"
            }
          ]}
          className="bg-background"
        />

        {/* Section Cara Kerja - Modern and Animated */}
        <HowItWorks />

        {/* Stats Section - Modern and Animated */}
        <Stats 
          total={stats.total} 
          processing={stats.byStatus['in progress'] || 0} 
          completed={stats.byStatus['resolved'] || 0} 
        />

        {/* Recent Submissions Section - Optimized with lazy loading */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Laporan Terbaru</h2>
              <p className="text-gray-600">Lihat laporan terbaru dari masyarakat Desa Pangkalan Baru</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card className="bg-gradient-to-br from-[#2E7D32]/5 to-white border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden rounded-xl">
                <CardContent className="p-6 flex items-center gap-6">
                  <div className="rounded-full bg-[#2E7D32]/10 p-4">
                    <Megaphone className="h-8 w-8 text-[#2E7D32]" />
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
    </PublicLayout>
  );
}
