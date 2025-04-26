"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Filter, ArrowUpDown, CalendarDays, Tag, CheckCircle, Loader2, AlertCircle, Sparkles, RefreshCw, MapPin, MessageSquare, Wrench, BookOpen, Stethoscope, HeartHandshake, Info } from 'lucide-react';
import type { Submission } from '@/lib/types'; // Assuming types are defined here
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale'; // Import Indonesian locale for date formatting
import Link from 'next/link';

// Define category icons based on blueprint
const categoryIcons: Record<string, React.ElementType> = {
  Infrastructure: Wrench,
  Education: BookOpen,
  Health: Stethoscope,
  'Social Welfare': HeartHandshake,
  Other: Info,
};

interface SubmissionListProps {
  submissions: Submission[];
  categories: string[];
  statuses: string[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  currentFilters: {
    category?: string;
    status?: string;
    sortBy?: string;
    search?: string;
  };
}

export default function SubmissionList({
  submissions,
  categories,
  statuses,
  currentPage,
  totalPages,
  totalCount,
  limit,
  currentFilters,
}: SubmissionListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for input values
  const [searchTerm, setSearchTerm] = React.useState(currentFilters.search || '');
  const [selectedCategory, setSelectedCategory] = React.useState(currentFilters.category || 'all');
  const [selectedStatus, setSelectedStatus] = React.useState(currentFilters.status || 'all');
  const [selectedSortBy, setSelectedSortBy] = React.useState(currentFilters.sortBy || 'date_desc');
  const [isLoading, setIsLoading] = React.useState(false);

  const createQueryString = React.useCallback(
    (params: Record<string, string | number | undefined>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === '' || value === 'all') {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }
      // Reset page to 1 when filters/search/sort change, unless it's only a page change
      if (params.page === undefined || Object.keys(params).length > 1) {
         newSearchParams.set('page', '1');
      }
      return newSearchParams.toString();
    },
    [searchParams]
  );

  const handleFilterChange = React.useCallback(() => {
    setIsLoading(true);
    const queryString = createQueryString({
      category: selectedCategory,
      status: selectedStatus,
      sortBy: selectedSortBy,
      search: searchTerm,
    });
    router.push(`${pathname}?${queryString}`);
    // Simulate loading state for better UX
    setTimeout(() => setIsLoading(false), 300);
  }, [createQueryString, pathname, router, selectedCategory, selectedStatus, selectedSortBy, searchTerm]);

  // Debounce search term updates
  React.useEffect(() => {
    const handler = setTimeout(() => {
      // Only trigger filter change if searchTerm has actually changed from the URL param
      if (searchTerm !== (currentFilters.search || '')) {
         handleFilterChange();
      }
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, handleFilterChange, currentFilters.search]);


  const handleSearchSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
       event?.preventDefault(); // Prevent default form submission if used
       // Trigger filter change immediately on form submit (Enter key)
       if (searchTerm !== (currentFilters.search || '')) {
           handleFilterChange();
       }
  }


  const handlePageChange = (page: number) => {
    setIsLoading(true);
    const queryString = createQueryString({
        category: selectedCategory,
        status: selectedStatus,
        sortBy: selectedSortBy,
        search: searchTerm,
        page: page // Keep current filters, only change page
    });
    router.push(`${pathname}?${queryString}`);
    // Simulate loading state for better UX
    setTimeout(() => setIsLoading(false), 300);
  };

  // Color mapping based on blueprint
  const getStatusBadgeColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'bg-[#4CAF50] text-white'; // Green from blueprint
      case 'in progress':
        return 'bg-yellow-500 text-white'; // Yellow for in progress
      case 'pending':
        return 'bg-[#F0F0F0] text-gray-700'; // Light gray from blueprint
      default:
        return 'bg-[#F0F0F0] text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'in progress':
        return <RefreshCw className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    const Icon = categoryIcons[category] || categoryIcons['Other'];
    return <Icon className="h-5 w-5 text-[#4CAF50]" />;
  };

  return (
    <div className="space-y-8">
      {/* Filters and Search Section */}
      <Card className="shadow-md rounded-lg border-0 overflow-hidden bg-white">
        <CardHeader className="pb-2 border-b border-[#F0F0F0]">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#4CAF50]"/> 
            <span>Filter & Cari Laporan</span>
          </CardTitle>
          <CardDescription>
            Gunakan filter untuk menemukan laporan yang relevan
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari berdasarkan kata kunci..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-lg border-[#F0F0F0] focus-visible:ring-[#2196F3]/50"
                />
              </div>
              {/* Hidden submit button for form submission on enter */}
              <button type="submit" hidden />
            </form>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label htmlFor="category-select" className="text-sm font-medium text-gray-500 mb-1.5 block">Kategori</label>
                <Select value={selectedCategory} onValueChange={(value) => { setSelectedCategory(value); }}>
                  <SelectTrigger id="category-select" className="w-full rounded-lg border-[#F0F0F0]">
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="flex items-center">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(cat)}
                          <span>{cat}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <label htmlFor="status-select" className="text-sm font-medium text-gray-500 mb-1.5 block">Status</label>
                <Select value={selectedStatus} onValueChange={(value) => { setSelectedStatus(value); }}>
                  <SelectTrigger id="status-select" className="w-full rounded-lg border-[#F0F0F0]">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    {statuses.map((stat) => (
                      <SelectItem key={stat} value={stat}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(stat)}
                          <span>{stat}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <label htmlFor="sortby-select" className="text-sm font-medium text-gray-500 mb-1.5 block">Urutkan</label>
                <Select value={selectedSortBy} onValueChange={(value) => { setSelectedSortBy(value); }}>
                  <SelectTrigger id="sortby-select" className="w-full rounded-lg border-[#F0F0F0]">
                    <SelectValue placeholder="Urutkan Berdasarkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_desc">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4" />
                        <span>Terbaru</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="date_asc">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4" />
                        <span>Terlama</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Apply Filters Button - Blueprint accent color blue #2196F3 */}
            <Button 
              onClick={handleFilterChange} 
              className="w-full sm:w-auto px-6 rounded-lg shadow-sm bg-[#2196F3] hover:bg-[#2196F3]/90 text-white transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Filter className="mr-2 h-4 w-4" />
              )}
              Terapkan Filter
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-sm text-gray-500 border-t border-[#F0F0F0] bg-[#F0F0F0]/30">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#4CAF50]" />
            Menampilkan {submissions.length} dari {totalCount} laporan
          </div>
        </CardFooter>
      </Card>

      {/* Submissions Display Section */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-[#4CAF50] animate-spin" />
          <span className="ml-2 text-gray-600">Memuat data...</span>
        </div>
      ) : submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Tidak Ada Laporan Ditemukan</h3>
          <p className="text-gray-500 max-w-md">
            Tidak ada laporan yang sesuai dengan kriteria pencarian Anda. Coba ubah filter atau istilah pencarian.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="overflow-hidden hover:shadow-md transition-shadow border-l-4 border-l-[#4CAF50] rounded-lg">
              <div className="grid md:grid-cols-[1fr_auto] gap-4">
                <div className="p-4 md:p-5">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge 
                      className={getStatusBadgeColor(submission.status)} 
                      variant="secondary"
                    >
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(submission.status)}
                        <span>{submission.status}</span>
                      </div>
                    </Badge>
                    
                    <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-700">
                      <div className="flex items-center gap-1.5">
                        {getCategoryIcon(submission.category)}
                        <span>{submission.category}</span>
                      </div>
                    </Badge>
                    
                    <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(submission.createdAt, { 
                            addSuffix: true, 
                            locale: id 
                          })}
                        </span>
                      </div>
                    </Badge>
                  </div>
                  
                  <h3 className="text-gray-800 font-semibold mb-3 flex items-center">
                    <span className="mr-2">Laporan ID: {submission.referenceId}</span>
                    {submission.priority === "Urgent" && (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        Prioritas Tinggi
                      </Badge>
                    )}
                  </h3>
                  
                  <Accordion type="single" collapsible className="border-b-0">
                    <AccordionItem value="description" className="border-b-0">
                      <AccordionTrigger className="text-sm py-1 px-0 font-normal text-[#2196F3] hover:text-[#1976D2] hover:no-underline">
                        Lihat Detail Laporan
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700 whitespace-pre-line">
                        <div className="bg-gray-50 p-3 rounded-md border border-gray-100 my-2">
                          {submission.description.length > 300 
                            ? `${submission.description.substring(0, 300)}...` 
                            : submission.description
                          }
                        </div>
                        
                        {submission.fileUrl && (
                          <div className="mt-2 flex items-center">
                            <a 
                              href={submission.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#2196F3] hover:underline flex items-center gap-1.5 text-sm"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paperclip">
                                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.47"/>
                              </svg>
                              Lihat Lampiran
                            </a>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                          <div className="flex items-center text-gray-500 text-sm">
                            <MapPin className="h-3.5 w-3.5 mr-1" /> 
                            Desa Pangkalan Baru
                          </div>
                          
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>
                              {submission.internalComments?.length || 0} komentar
                            </span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  {/* Progress Indicator */}
                  <div className="mt-4 pt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-500">
                        Status Penanganan
                      </span>
                      <span className="text-xs font-medium text-gray-700">
                        {submission.status === 'pending' ? '0%' : 
                         submission.status === 'in progress' ? '50%' : '100%'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          submission.status === 'pending' ? 'w-0 bg-gray-300' : 
                          submission.status === 'in progress' ? 'w-1/2 bg-yellow-500' : 
                          'w-full bg-[#4CAF50]'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons on right side for larger screens */}
                <div className="bg-gray-50 flex flex-col md:justify-center items-center py-4 px-5 border-t md:border-t-0 md:border-l border-gray-200">
                  <Button 
                    asChild 
                    variant="default"
                    className="w-full bg-[#2196F3] hover:bg-[#1976D2] text-white"
                  >
                    <Link href={`/track?id=${submission.referenceId}`}>
                      Lacak Status
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={currentPage > 1 ? `${pathname}?${createQueryString({ page: currentPage - 1, category: selectedCategory, status: selectedStatus, sortBy: selectedSortBy, search: searchTerm })}` : '#'}
                  aria-disabled={currentPage <= 1}
                  tabIndex={currentPage <= 1 ? -1 : undefined}
                  className={`${currentPage <= 1 ? "pointer-events-none opacity-50" : ""} text-[#2196F3]`}
                  onClick={(e) => { 
                    if (currentPage <= 1) {
                      e.preventDefault();
                    } else {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }
                  }}
                />
              </PaginationItem>

              {/* Simplified Pagination Logic - Consider a more robust solution for many pages */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href={`${pathname}?${createQueryString({ page: page, category: selectedCategory, status: selectedStatus, sortBy: selectedSortBy, search: searchTerm })}`}
                    isActive={currentPage === page}
                    aria-current={currentPage === page ? "page" : undefined}
                    className={currentPage === page ? "bg-[#4CAF50] text-white hover:bg-[#4CAF50]/90" : "text-gray-700 hover:bg-[#F0F0F0]"}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href={currentPage < totalPages ? `${pathname}?${createQueryString({ page: currentPage + 1, category: selectedCategory, status: selectedStatus, sortBy: selectedSortBy, search: searchTerm })}` : '#'}
                  aria-disabled={currentPage >= totalPages}
                  tabIndex={currentPage >= totalPages ? -1 : undefined}
                  className={`${currentPage >= totalPages ? "pointer-events-none opacity-50" : ""} text-[#2196F3]`}
                  onClick={(e) => { 
                    if (currentPage >= totalPages) {
                      e.preventDefault(); 
                    } else {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
