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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

  // Local state for input values with proper initialization
  const [searchTerm, setSearchTerm] = useState(currentFilters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(currentFilters.category || 'all');
  const [selectedStatus, setSelectedStatus] = useState(currentFilters.status || 'all');
  const [selectedSortBy, setSelectedSortBy] = useState(currentFilters.sortBy || 'date_desc');
  const [isLoading, setIsLoading] = useState(false);
  
  // Flags to prevent redundant operations
  const isFirstRender = useRef(true);
  const navigationInProgress = useRef(false);
  const searchDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const filterChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAppliedFilters = useRef({
    category: currentFilters.category || 'all',
    status: currentFilters.status || 'all',
    search: currentFilters.search || '',
    sortBy: currentFilters.sortBy || 'date_desc',
    page: currentPage
  });

  // Status mapping for consistent values
  const statusMap = {
    'Pending': 'pending',
    'In Progress': 'in progress',
    'Resolved': 'resolved',
    'pending': 'pending',
    'in progress': 'in progress',
    'resolved': 'resolved'
  } as const;

  // Reverse status mapping for display
  const reverseStatusMap = {
    'pending': 'Pending',
    'in progress': 'In Progress',
    'resolved': 'Resolved'
  };

  // Create URL query string with proper handling of filter values
  const createQueryString = useCallback(
    (params: Record<string, string | number | undefined>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString());
      
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === '' || value === 'all') {
          newSearchParams.delete(key);
        } else {
          if (key === 'status' && typeof value === 'string') {
            // Ensure status is properly formatted for the backend
            const normalizedStatus = statusMap[value as keyof typeof statusMap] || value.toLowerCase();
            newSearchParams.set(key, normalizedStatus);
          } else {
            newSearchParams.set(key, String(value));
          }
        }
      });
      
      // Ensure page is reset when filters change
      if (!params.hasOwnProperty('page')) {
        newSearchParams.set('page', '1');
      }
      
      return newSearchParams.toString();
    },
    [searchParams, statusMap]
  );

  // Handle filter changes with throttle to prevent excessive requests
  const handleFilterChange = useCallback(
    (resetPage: boolean = true) => {
      // Skip if navigation already in progress
      if (navigationInProgress.current) return;

      // Clear any pending timeout to avoid multiple requests
      if (filterChangeTimeoutRef.current) {
        clearTimeout(filterChangeTimeoutRef.current);
      }

      // Build current filter state
      const currentFilterState = {
        category: selectedCategory,
        status: selectedStatus,
        search: searchTerm,
        sortBy: selectedSortBy,
        page: resetPage ? 1 : currentPage
      };

      // Skip if filters haven't changed
      if (
        currentFilterState.category === lastAppliedFilters.current.category &&
        currentFilterState.status === lastAppliedFilters.current.status &&
        currentFilterState.search === lastAppliedFilters.current.search &&
        currentFilterState.sortBy === lastAppliedFilters.current.sortBy &&
        currentFilterState.page === lastAppliedFilters.current.page
      ) {
        return;
      }

      // Set loading state immediately
      setIsLoading(true);
      
      // Update last applied filters immediately to prevent duplicate requests
      lastAppliedFilters.current = { ...currentFilterState };
      
      // Execute filter immediately without throttling for manual filter button press
      const queryString = createQueryString({
        category: selectedCategory,
        status: selectedStatus,
        search: searchTerm,
        sortBy: selectedSortBy,
        ...(resetPage ? { page: 1 } : { page: currentPage })
      });
      
      try {
        navigationInProgress.current = true;
        
        // Push route change - Next.js will automatically trigger a server fetch
        router.push(`${pathname}?${queryString}`, { scroll: false });
        
        // Add safety timeout to ensure loading state is eventually reset even if 
        // the route change doesn't complete properly
        setTimeout(() => {
          if (isLoading) {
            setIsLoading(false);
            navigationInProgress.current = false;
          }
        }, 5000); // 5-second safety timeout
      } catch (error) {
        console.error('Error updating filters:', error);
        setIsLoading(false);
        navigationInProgress.current = false;
      }
    },
    [createQueryString, pathname, router, selectedCategory, selectedStatus, searchTerm, selectedSortBy, currentPage, isLoading]
  );

  // Reset filters to default
  const handleResetFilters = useCallback(() => {
    if (navigationInProgress.current) return;
    
    // Check if there are any active filters to reset
    if (
      selectedCategory === 'all' && 
      selectedStatus === 'all' && 
      !searchTerm && 
      selectedSortBy === 'date_desc'
    ) {
      return; // Nothing to reset
    }
    
    // Clear any pending timers
    if (filterChangeTimeoutRef.current) {
      clearTimeout(filterChangeTimeoutRef.current);
    }
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }
    
    // Update local state
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSearchTerm('');
    setSelectedSortBy('date_desc');
    
    // Trigger filter change with clean values
    setIsLoading(true);
    
    // Create a clean query string
    const queryString = createQueryString({
      page: 1,
      // Explicitly set to undefined to ensure they're removed
      category: undefined,
      status: undefined,
      search: undefined,
      sortBy: undefined
    });
    
    // Update last applied filters
    lastAppliedFilters.current = {
      category: 'all',
      status: 'all',
      search: '',
      sortBy: 'date_desc',
      page: 1
    };
    
    navigationInProgress.current = true;
    
    try {
      // Directly navigate without Promise.resolve wrapping
      router.push(`${pathname}?${queryString}`, { scroll: false });
      
      // Add safety timeout to ensure loading state is reset even if navigation fails
      setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          navigationInProgress.current = false;
        }
      }, 5000); // 5-second safety timeout
    } catch (error) {
      console.error('Error resetting filters:', error);
      setIsLoading(false);
      navigationInProgress.current = false;
    }
  }, [createQueryString, pathname, router, searchTerm, selectedCategory, selectedStatus, selectedSortBy, isLoading]);

  // Handle search with improved immediate processing
  useEffect(() => {
    if (isFirstRender.current || navigationInProgress.current) return;
    
    // Skip if search term matches the last applied search
    if (searchTerm === lastAppliedFilters.current.search) return;
    
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }
    
    // Set a visual indicator that search is happening without triggering loading state
    searchDebounceTimer.current = setTimeout(() => {
      handleFilterChange(true);
    }, 500); // Reduced from 800ms to make search feel more responsive

    return () => {
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }
    };
  }, [searchTerm, handleFilterChange]);

  // Listen for route changes to ensure loading state is properly managed
  useEffect(() => {
    // In Next.js App Router, we don't have access to router events directly
    // Instead, we'll use a cleanup mechanism when the component unmounts
    
    // Create a flag to track if the component is still mounted
    const isMounted = { current: true };
    
    // Add safety timeout to reset loading state if it gets stuck
    const safetyTimer = setTimeout(() => {
      if (isMounted.current && isLoading) {
        setIsLoading(false);
        navigationInProgress.current = false;
      }
    }, 5000);
    
    return () => {
      isMounted.current = false;
      clearTimeout(safetyTimer);
    };
  }, [isLoading]);

  // Clean up all pending operations when component unmounts
  useEffect(() => {
    return () => {
      // Clear any pending timers
      if (filterChangeTimeoutRef.current) {
        clearTimeout(filterChangeTimeoutRef.current);
      }
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }
      
      // Reset flags
      navigationInProgress.current = false;
    };
  }, []);

  // Initialize filters from URL on first render only
  useEffect(() => {
    if (!isFirstRender.current) return;
    
    const currentCategory = searchParams?.get('category') || 'all';
    const currentStatus = searchParams?.get('status') || 'all';
    const currentSearch = searchParams?.get('search') || '';
    const currentSortBy = searchParams?.get('sortBy') || 'date_desc';

    // Initialize last applied filters
    lastAppliedFilters.current = {
      category: currentCategory,
      status: currentStatus,
      search: currentSearch,
      sortBy: currentSortBy,
      page: currentPage
    };

    // Only update state if different from initial values
    if (currentCategory !== selectedCategory) {
      setSelectedCategory(currentCategory);
    }
    
    if (currentStatus !== selectedStatus) {
      setSelectedStatus(currentStatus);
    }
    
    if (currentSearch !== searchTerm) {
      setSearchTerm(currentSearch);
    }
    
    if (currentSortBy !== selectedSortBy) {
      setSelectedSortBy(currentSortBy);
    }

    isFirstRender.current = false;
  }, [searchParams, currentPage]);

  // Sync component state with URL parameters when they change externally
  useEffect(() => {
    if (isFirstRender.current || navigationInProgress.current) return;
    
    const urlCategory = searchParams?.get('category') || 'all';
    const urlStatus = searchParams?.get('status') || 'all';
    const urlSearch = searchParams?.get('search') || '';
    const urlSortBy = searchParams?.get('sortBy') || 'date_desc';

    // Only update if URL params have changed from what we know
    const needsUpdate = 
      urlCategory !== selectedCategory ||
      urlStatus !== selectedStatus ||
      urlSearch !== searchTerm ||
      urlSortBy !== selectedSortBy;

    if (needsUpdate) {
      if (urlCategory !== selectedCategory) setSelectedCategory(urlCategory);
      if (urlStatus !== selectedStatus) setSelectedStatus(urlStatus);
      if (urlSearch !== searchTerm) setSearchTerm(urlSearch);
      if (urlSortBy !== selectedSortBy) setSelectedSortBy(urlSortBy);
      
      // Update last applied filters
      lastAppliedFilters.current = {
        category: urlCategory,
        status: urlStatus,
        search: urlSearch,
        sortBy: urlSortBy,
        page: currentPage
      };
    }
  }, [searchParams, currentPage]);

  // Handle form submission
  const handleSearchSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    
    // Skip if navigation is in progress
    if (navigationInProgress.current) return;
    
    // Clear search debounce timer
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
      searchDebounceTimer.current = null;
    }
    
    handleFilterChange(true);
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    // Skip if navigation is in progress or page hasn't changed
    if (navigationInProgress.current || page === currentPage) return;
    
    setIsLoading(true);
    const queryString = createQueryString({
      category: selectedCategory,
      status: selectedStatus,
      search: searchTerm,
      sortBy: selectedSortBy,
      page
    });
    
    // Update last applied filters
    lastAppliedFilters.current = {
      ...lastAppliedFilters.current,
      page
    };
    
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };

  // Color mapping based on blueprint
  const getStatusBadgeColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'bg-[#1B5E20] text-white hover:bg-[#1B5E20]/90';
      case 'in progress':
        return 'bg-[#7F4700] text-white hover:bg-[#7F4700]/90';
      case 'pending':
        return 'bg-[#424242] text-white hover:bg-[#424242]/90';
      default:
        return 'bg-[#424242] text-white hover:bg-[#424242]/90';
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
    return <Icon className="h-5 w-5 text-[#2E7D32]" />;
  };

  return (
    <div className="space-y-8">
      {/* Filters and Search Section */}
      <Card className="shadow-md rounded-lg border-0 overflow-hidden bg-white">
        <CardHeader className="pb-2 border-b border-[#F0F0F0]">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#4CAF50]"/> 
            <span>Filter Laporan</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Search Input with immediate feedback */}
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
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Filter with active state indication */}
              <div>
                <label htmlFor="category-select" className="text-sm font-medium text-gray-500 mb-1.5 block">
                  Kategori {selectedCategory !== 'all' && `(${selectedCategory})`}
                </label>
                <Select 
                  value={selectedCategory} 
                  onValueChange={(value) => {
                    if (value === selectedCategory) return;
                    setSelectedCategory(value);
                  }}
                >
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
                <label htmlFor="status-select" className="text-sm font-medium text-gray-500 mb-1.5 block">
                  Status {selectedStatus !== 'all' && `(${selectedStatus})`}
                </label>
                <Select 
                  value={selectedStatus} 
                  onValueChange={(value) => {
                    if (value === selectedStatus) return;
                    setSelectedStatus(value);
                  }}
                >
                  <SelectTrigger id="status-select" className="w-full rounded-lg border-[#F0F0F0]">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    {statuses.map((stat) => (
                      <SelectItem key={stat} value={stat}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(stat.toLowerCase())}
                          <span>{stat}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Button Section */}
            <div className="flex justify-between mt-2">
              <Button 
                type="button"
                onClick={handleResetFilters}
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                disabled={isLoading || (selectedCategory === 'all' && selectedStatus === 'all' && !searchTerm && selectedSortBy === 'date_desc')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-ccw">
                  <path d="M3 2v6h6"></path>
                  <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
                  <path d="M21 22v-6h-6"></path>
                  <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
                </svg>
                Reset Filter
              </Button>

              <Button 
                type="button"
                onClick={() => handleFilterChange(true)}
                className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white flex items-center gap-2"
                disabled={isLoading}
              >
                <Filter className="h-4 w-4" />
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Memproses...
                  </>
                ) : 'Terapkan Filter'}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-[#F0F0F0] bg-gray-50 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#4CAF50]" />
            <span className="text-sm text-gray-600">
              Menampilkan {submissions.length} dari {totalCount} laporan
              {(selectedCategory !== 'all' || selectedStatus !== 'all' || searchTerm) && (
                <span className="ml-1">
                  {selectedCategory !== 'all' && ` • Kategori: ${selectedCategory}`}
                  {selectedStatus !== 'all' && ` • Status: ${selectedStatus}`}
                  {searchTerm && ` • Pencarian: "${searchTerm}"`}
                </span>
              )}
            </span>
          </div>
        </CardFooter>
      </Card>

      {/* Submissions Display Section */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-[#2E7D32] animate-spin" />
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
            <Card key={submission.id} className="overflow-hidden hover:shadow-md transition-shadow border-l-4 border-l-[#2E7D32] rounded-lg">
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
                      <AccordionTrigger className="text-sm py-1 px-0 font-normal text-[#0D47A1] hover:text-[#0A3880] hover:no-underline">
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
                              className="text-[#0D47A1] hover:underline flex items-center gap-1.5 text-sm"
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
                          submission.status === 'in progress' ? 'w-1/2 bg-[#7F4700]' : 
                          'w-full bg-[#1B5E20]'
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
                    className="w-full bg-[#0D47A1] hover:bg-[#0A3880] text-white"
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
                  href={currentPage > 1 ? `${pathname}?${createQueryString({ page: currentPage - 1, category: selectedCategory, status: selectedStatus, search: searchTerm })}` : '#'}
                  aria-disabled={currentPage <= 1}
                  tabIndex={currentPage <= 1 ? -1 : undefined}
                  className={`${currentPage <= 1 ? "pointer-events-none opacity-50" : ""} text-[#0D47A1]`}
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
                    href={`${pathname}?${createQueryString({ page: page, category: selectedCategory, status: selectedStatus, search: searchTerm })}`}
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
                  href={currentPage < totalPages ? `${pathname}?${createQueryString({ page: currentPage + 1, category: selectedCategory, status: selectedStatus, search: searchTerm })}` : '#'}
                  aria-disabled={currentPage >= totalPages}
                  tabIndex={currentPage >= totalPages ? -1 : undefined}
                  className={`${currentPage >= totalPages ? "pointer-events-none opacity-50" : ""} text-[#0D47A1]`}
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
