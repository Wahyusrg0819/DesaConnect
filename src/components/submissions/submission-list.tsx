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
import { Search, Filter, ArrowUpDown, CalendarDays, Tag, CheckCircle, Loader2, AlertCircle, Sparkles, RefreshCw, MapPin, MessageSquare, Wrench, BookOpen, Stethoscope, HeartHandshake, Info, ChevronRight } from 'lucide-react';
import type { Submission } from '@/lib/types'; // Assuming types are defined here
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale'; // Import Indonesian locale for date formatting
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="shadow-lg rounded-xl border border-gray-100/50 overflow-hidden bg-white/95 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:bg-white">
          <CardHeader className="pb-3 border-b border-[#E8F5E9] bg-gradient-to-r from-[#E8F5E9] via-white to-white">
            <CardTitle className="text-lg md:text-xl font-semibold flex items-center gap-2 md:gap-3 text-[#1B5E20]">
              <Filter className="h-5 w-5 md:h-6 md:w-6 text-[#4CAF50]"/> 
              <span>Filter Laporan</span>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-auto"
                >
                  <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin text-[#4CAF50]" />
                </motion.div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 md:pt-6">
            <div className="space-y-4 md:space-y-6">
              {/* Search Input with immediate feedback */}
              <form onSubmit={handleSearchSubmit} className="w-full">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors duration-200 group-hover:text-[#4CAF50]" />
                  <Input
                    placeholder="Cari berdasarkan kata kunci..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full rounded-lg border-[#E8F5E9] focus-visible:ring-[#4CAF50]/30 transition-all duration-200 bg-[#F9FDF9] hover:bg-white focus:bg-white shadow-sm text-sm md:text-base"
                  />
                </div>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {/* Category Filter with active state indication */}
                <div>
                  <label htmlFor="category-select" className="text-sm font-medium text-gray-500 mb-1.5 block">
                    Kategori {selectedCategory !== 'all' && (
                      <span className="inline-flex items-center text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-full text-xs ml-2">
                        {selectedCategory}
                      </span>
                    )}
                  </label>
                  <Select 
                    value={selectedCategory} 
                    onValueChange={(value) => {
                      if (value === selectedCategory) return;
                      setSelectedCategory(value);
                    }}
                  >
                    <SelectTrigger 
                      id="category-select" 
                      className="w-full rounded-lg border-[#F0F0F0] bg-gray-50 hover:bg-white transition-all duration-200 focus:ring-[#2E7D32]/20"
                    >
                      <SelectValue placeholder="Semua Kategori" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-[#F0F0F0] shadow-lg">
                      <SelectItem value="all" className="focus:bg-[#E8F5E9] focus:text-[#2E7D32]">
                        Semua Kategori
                      </SelectItem>
                      {categories.map((cat) => (
                        <SelectItem 
                          key={cat} 
                          value={cat} 
                          className="flex items-center focus:bg-[#E8F5E9] focus:text-[#2E7D32]"
                        >
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
                  <label htmlFor="status-select" className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1.5 text-[#4CAF50]" />
                    Status {selectedStatus !== 'all' && (
                      <motion.span 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center text-[#1B5E20] bg-[#E8F5E9] px-2 py-0.5 rounded-full text-xs ml-2 border border-[#4CAF50]/20"
                      >
                        {selectedStatus}
                      </motion.span>
                    )}
                  </label>
                  <Select 
                    value={selectedStatus} 
                    onValueChange={(value) => {
                      if (value === selectedStatus) return;
                      setSelectedStatus(value);
                    }}
                  >
                    <SelectTrigger 
                      id="status-select" 
                      className="w-full rounded-lg border-[#E8F5E9] bg-[#F9FDF9] hover:bg-white transition-all duration-200 focus:ring-[#4CAF50]/30 shadow-sm"
                    >
                      <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-[#E8F5E9] shadow-lg bg-white/95 backdrop-blur-sm">
                      <SelectItem value="all" className="focus:bg-[#E8F5E9] focus:text-[#1B5E20] hover:bg-[#E8F5E9]/50">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-[#4CAF50]" />
                          <span>Semua Status</span>
                        </div>
                      </SelectItem>
                      {statuses.map((stat) => (
                        <SelectItem 
                          key={stat} 
                          value={stat}
                          className="focus:bg-[#E8F5E9] focus:text-[#1B5E20] hover:bg-[#E8F5E9]/50"
                        >
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
              <div className="flex flex-col sm:flex-row justify-between gap-3 md:gap-2 mt-2">
                <Button 
                  type="button"
                  onClick={handleResetFilters}
                  variant="outline"
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
                  disabled={isLoading || (selectedCategory === 'all' && selectedStatus === 'all' && !searchTerm && selectedSortBy === 'date_desc')}
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset Filter
                </Button>

                <Button 
                  type="button"
                  onClick={() => handleFilterChange(true)}
                  className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow w-full sm:w-auto"
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
          <CardFooter className="border-t border-[#F0F0F0] bg-gradient-to-r from-[#f8f9fa] to-white py-3">
            <div className="flex items-center gap-2 w-full">
              <Sparkles className="h-4 w-4 text-[#4CAF50] flex-shrink-0" />
              <span className="text-xs md:text-sm text-gray-600">
                Menampilkan {submissions.length} dari {totalCount} laporan
                {(selectedCategory !== 'all' || selectedStatus !== 'all' || searchTerm) && (
                  <span className="block mt-1 md:inline md:ml-1">
                    {selectedCategory !== 'all' && (
                      <span className="inline-flex items-center text-[#2E7D32] text-xs">
                        • Kategori: {selectedCategory}
                      </span>
                    )}
                    {selectedStatus !== 'all' && (
                      <span className="inline-flex items-center text-[#0D47A1] text-xs ml-1">
                        • Status: {selectedStatus}
                      </span>
                    )}
                    {searchTerm && (
                      <span className="inline-flex items-center text-gray-600 text-xs ml-1">
                        • Pencarian: "{searchTerm}"
                      </span>
                    )}
                  </span>
                )}
              </span>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Submissions Display Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12 md:py-16 bg-white/50 rounded-xl border border-gray-100 shadow-sm mx-2 md:mx-0">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 md:h-10 md:w-10 text-[#2E7D32] animate-spin mb-3" />
              <span className="text-gray-600 font-medium text-sm md:text-base">Memuat data laporan...</span>
            </div>
          </div>
        ) : submissions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-12 md:py-16 text-center bg-white rounded-xl border border-gray-100 shadow-sm mx-2 md:mx-0"
          >
            <motion.div 
              className="bg-gray-50 p-3 md:p-4 rounded-full mb-3 md:mb-4"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <AlertCircle className="h-10 w-10 md:h-12 md:w-12 text-[#4CAF50]" />
            </motion.div>
            <h3 className="text-lg md:text-xl font-semibold text-[#1B5E20] mb-2">Tidak Ada Laporan Ditemukan</h3>
            <p className="text-gray-500 max-w-md text-sm md:text-base px-4">
              Tidak ada laporan yang sesuai dengan kriteria pencarian Anda. Coba ubah filter atau istilah pencarian.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4 md:space-y-5 px-2 md:px-0">
            {submissions.map((submission, index) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="transform transition-all duration-300"
              >
                <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-l-[#2E7D32] rounded-xl bg-white">
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-0">
                    <div className="p-4 md:p-5 lg:p-6">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge 
                          className={`${getStatusBadgeColor(submission.status)} transition-all duration-300 shadow-sm text-xs md:text-sm`} 
                          variant="secondary"
                        >
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(submission.status)}
                            <span>{submission.status}</span>
                          </div>
                        </Badge>
                        
                        <Badge 
                          variant="outline" 
                          className="border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors duration-200 text-xs md:text-sm"
                        >
                          <div className="flex items-center gap-1.5">
                            {getCategoryIcon(submission.category)}
                            <span className="hidden sm:inline">{submission.category}</span>
                            <span className="sm:hidden">{submission.category.length > 10 ? submission.category.substring(0, 8) + '...' : submission.category}</span>
                          </div>
                        </Badge>
                        
                        <Badge 
                          variant="outline" 
                          className="border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors duration-200 text-xs md:text-sm"
                        >
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-3 w-3" />
                            <span className="hidden sm:inline">
                              {formatDistanceToNow(submission.createdAt, { 
                                addSuffix: true, 
                                locale: id 
                              })}
                            </span>
                            <span className="sm:hidden">
                              {formatDistanceToNow(submission.createdAt, { 
                                addSuffix: true, 
                                locale: id 
                              }).replace('sekitar ', '').replace(' yang lalu', '')}
                            </span>
                          </div>
                        </Badge>
                      </div>
                      
                      <h3 className="text-gray-800 font-semibold mb-3 flex flex-col sm:flex-row sm:items-center text-base md:text-lg">
                        <span className="mr-0 sm:mr-2">Laporan ID: {submission.referenceId}</span>
                        {submission.priority === "Urgent" && (
                          <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse mt-1 sm:mt-0 w-fit">
                            Prioritas Tinggi
                          </Badge>
                        )}
                      </h3>
                      
                      <Accordion type="single" collapsible className="border-b-0">
                        <AccordionItem value="description" className="border-b-0">
                          <AccordionTrigger className="text-xs md:text-sm py-2 px-0 font-medium text-[#0D47A1] hover:text-[#0A3880] hover:no-underline transition-all duration-200 group">
                            <div className="flex items-center">
                              <span>Lihat Detail Laporan</span>
                              <ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-1 text-[#0D47A1] group-hover:translate-x-1 transition-transform duration-200" />
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-700 whitespace-pre-line text-sm md:text-base">
                            <div className="bg-gradient-to-r from-gray-50 to-white p-3 md:p-4 rounded-md border border-gray-100 my-2 shadow-inner">
                              {submission.description.length > 200 
                                ? `${submission.description.substring(0, 200)}...` 
                                : submission.description
                              }
                            </div>
                            
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 pt-3 border-t border-gray-100 gap-2">
                              <div className="flex items-center text-gray-500 text-xs md:text-sm bg-gray-50 px-2 py-1 rounded-md">
                                <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 text-[#2E7D32]" /> 
                                Desa Pangkalan Baru
                              </div>
                              
                              <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                                <MessageSquare className="h-3 w-3 md:h-3.5 md:w-3.5 text-[#0D47A1]" />
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
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs md:text-sm font-medium text-gray-700">
                            Status Penanganan
                          </span>
                          <span className="text-xs md:text-sm font-medium text-gray-700">
                            {submission.status === 'pending' ? '0%' : 
                             submission.status === 'in progress' ? '50%' : '100%'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 md:h-2.5 shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ 
                              width: submission.status === 'pending' ? '0%' : 
                                     submission.status === 'in progress' ? '50%' : '100%' 
                            }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-2 md:h-2.5 rounded-full ${
                              submission.status === 'pending' ? 'bg-gray-300' : 
                              submission.status === 'in progress' ? 'bg-[#7F4700]' : 
                              'bg-[#1B5E20]'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons - Mobile friendly */}
                    <div className="bg-gradient-to-b from-gray-50 to-white flex flex-col justify-center items-center py-4 md:py-5 px-4 md:px-6 border-t lg:border-t-0 lg:border-l border-gray-200">
                      <Button 
                        asChild 
                        variant="default"
                        className="w-full bg-[#0D47A1] hover:bg-[#0A3880] text-white transition-all duration-300 shadow-sm hover:shadow font-medium text-sm md:text-base"
                      >
                        <Link href={`/track?id=${submission.referenceId}`} className="flex items-center justify-center gap-1">
                          <span className="hidden sm:inline">Lacak Status</span>
                          <span className="sm:hidden">Lacak</span>
                          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div 
          className="flex justify-center mt-6 md:mt-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs md:text-sm text-gray-500 mb-1 text-center px-4">
              Menampilkan halaman <span className="font-medium text-gray-800">{currentPage}</span> dari <span className="font-medium text-gray-800">{totalPages}</span>
            </p>
            <Pagination className="shadow-sm bg-white rounded-lg p-1 border border-[#E8F5E9] w-fit">
              <PaginationContent className="gap-1 md:gap-2">
                <PaginationItem>
                  <PaginationPrevious
                    href={currentPage > 1 ? `${pathname}?${createQueryString({ page: currentPage - 1, category: selectedCategory, status: selectedStatus, search: searchTerm })}` : '#'}
                    aria-disabled={currentPage <= 1}
                    tabIndex={currentPage <= 1 ? -1 : undefined}
                    className={`transition-all duration-200 rounded-lg border-[#E8F5E9] hover:bg-[#E8F5E9] hover:text-[#1B5E20] ${currentPage <= 1 ? "pointer-events-none opacity-50" : ""} text-[#2E7D32] text-xs md:text-sm px-2 md:px-3`}
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

                {/* Show fewer page numbers on mobile */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // On mobile (small screens), show only current page and adjacent pages
                    if (totalPages <= 5) return true;
                    return Math.abs(page - currentPage) <= 1;
                  })
                  .map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href={`${pathname}?${createQueryString({ page: page, category: selectedCategory, status: selectedStatus, search: searchTerm })}`}
                      isActive={currentPage === page}
                      aria-current={currentPage === page ? "page" : undefined}
                      className={`transition-all duration-200 rounded-lg border-[#E8F5E9] ${currentPage === page ? 'bg-[#E8F5E9] text-[#1B5E20] font-medium border-[#4CAF50]' : 'text-gray-700 hover:bg-[#E8F5E9] hover:text-[#1B5E20]'} text-xs md:text-sm px-2 md:px-3 min-w-[32px] md:min-w-[36px]`}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {/* Show ellipsis on mobile if needed */}
                {totalPages > 5 && currentPage < totalPages - 1 && (
                  <PaginationItem>
                    <PaginationEllipsis className="text-xs md:text-sm" />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    href={currentPage < totalPages ? `${pathname}?${createQueryString({ page: currentPage + 1, category: selectedCategory, status: selectedStatus, search: searchTerm })}` : '#'}
                    aria-disabled={currentPage >= totalPages}
                    tabIndex={currentPage >= totalPages ? -1 : undefined}
                    className={`transition-all duration-200 rounded-lg border-[#E8F5E9] hover:bg-[#E8F5E9] hover:text-[#1B5E20] ${currentPage >= totalPages ? "pointer-events-none opacity-50" : ""} text-[#2E7D32] text-xs md:text-sm px-2 md:px-3`}
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
        </motion.div>
      )}
    </div>
  );
}
