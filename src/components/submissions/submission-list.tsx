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
import { Search, Filter, ArrowUpDown, CalendarDays, Tag, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import type { Submission } from '@/lib/types'; // Assuming types are defined here
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale'; // Import Indonesian locale for date formatting

interface SubmissionListProps {
  submissions: Submission[];
  categories: string[];
  statuses: string[];
  categoryIcons: Record<string, React.ElementType>;
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
  categoryIcons,
  currentPage,
  totalPages,
  totalCount,
  limit,
  currentFilters,
}: SubmissionListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for input values, synced with URL params on interaction
  const [searchTerm, setSearchTerm] = React.useState(currentFilters.search || '');
  const [selectedCategory, setSelectedCategory] = React.useState(currentFilters.category || 'all');
  const [selectedStatus, setSelectedStatus] = React.useState(currentFilters.status || 'all');
  const [selectedSortBy, setSelectedSortBy] = React.useState(currentFilters.sortBy || 'date_desc');

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
      // Reset page to 1 when filters/search/sort change
      if (params.category !== undefined || params.status !== undefined || params.search !== undefined || params.sortBy !== undefined) {
        newSearchParams.set('page', '1');
      }
      return newSearchParams.toString();
    },
    [searchParams]
  );

  const handleFilterChange = () => {
    const queryString = createQueryString({
      category: selectedCategory,
      status: selectedStatus,
      sortBy: selectedSortBy,
      search: searchTerm,
      page: 1, // Reset page on filter change
    });
    router.push(`${pathname}?${queryString}`);
  };

   const handleSearch = (event?: React.FormEvent<HTMLFormElement>) => {
        event?.preventDefault(); // Prevent default form submission if used
        handleFilterChange();
   }

  const handlePageChange = (page: number) => {
    const queryString = createQueryString({ page });
    router.push(`${pathname}?${queryString}`);
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'default'; // Green (using primary color via theme)
      case 'in progress':
        return 'secondary'; // Use theme's secondary (maybe yellow/orange if customized)
      case 'pending':
        return 'outline'; // Neutral outline
      default:
        return 'outline';
    }
  };

    const getStatusTextColor = (status: string): string => {
        switch (status.toLowerCase()) {
        case 'resolved':
            return 'text-primary'; // Green text
        case 'in progress':
            return 'text-yellow-600 dark:text-yellow-400'; // Example: Yellowish text
        case 'pending':
            return 'text-muted-foreground'; // Gray text
        default:
            return 'text-muted-foreground';
        }
    };

   const getCategoryIcon = (category: string) => {
     const Icon = categoryIcons[category] || categoryIcons['Other'];
     return <Icon className="h-5 w-5 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />;
   };


  return (
    <div className="space-y-6">
      {/* Filters and Search Section */}
      <Card className="shadow-md rounded-lg bg-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2"><Filter className="h-5 w-5 text-primary"/> Filter & Cari Laporan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-0 md:flex md:flex-wrap md:items-end md:gap-4">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex-grow md:flex-grow-0 md:w-full lg:w-auto lg:flex-1 min-w-[200px]">
             <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan kata kunci..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            {/* Hidden submit button for form submission on enter */}
            <button type="submit" hidden />
          </form>

          {/* Category Filter */}
          <div className="flex-grow md:flex-grow-0 min-w-[150px]">
            <label htmlFor="category-select" className="text-sm font-medium text-muted-foreground mb-1 block">Kategori</label>
            <Select value={selectedCategory} onValueChange={(value) => { setSelectedCategory(value); handleFilterChange(); }}>
              <SelectTrigger id="category-select">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="flex-grow md:flex-grow-0 min-w-[150px]">
             <label htmlFor="status-select" className="text-sm font-medium text-muted-foreground mb-1 block">Status</label>
            <Select value={selectedStatus} onValueChange={(value) => { setSelectedStatus(value); handleFilterChange(); }}>
              <SelectTrigger id="status-select">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {statuses.map((stat) => (
                  <SelectItem key={stat} value={stat}>{stat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="flex-grow md:flex-grow-0 min-w-[150px]">
             <label htmlFor="sortby-select" className="text-sm font-medium text-muted-foreground mb-1 block">Urutkan</label>
            <Select value={selectedSortBy} onValueChange={(value) => { setSelectedSortBy(value); handleFilterChange(); }}>
              <SelectTrigger id="sortby-select">
                <SelectValue placeholder="Urutkan Berdasarkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Terbaru</SelectItem>
                <SelectItem value="date_asc">Terlama</SelectItem>
                {/* Add priority sorting if implemented */}
                {/* <SelectItem value="priority_desc">Prioritas Tinggi</SelectItem> */}
                {/* <SelectItem value="priority_asc">Prioritas Rendah</SelectItem> */}
              </SelectContent>
            </Select>
          </div>

          {/* Apply Filters Button (Optional, can auto-apply on change) */}
          {/* <Button onClick={handleFilterChange} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Filter className="mr-2 h-4 w-4" /> Terapkan Filter
          </Button> */}
        </CardContent>
         <CardFooter className="text-sm text-muted-foreground">
            Menampilkan {submissions.length} dari {totalCount} laporan.
        </CardFooter>
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.length > 0 ? (
          submissions.map((submission) => (
            <Accordion type="single" collapsible key={submission.id} className="w-full">
             <AccordionItem value={`item-${submission.id}`} className="border bg-card rounded-lg shadow-sm overflow-hidden">
                 <AccordionTrigger className="px-4 py-3 hover:bg-secondary/50 group">
                   <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-2 md:gap-4">
                     <div className="flex items-center flex-1 min-w-0">
                       {getCategoryIcon(submission.category)}
                       <div className="flex-1 min-w-0">
                         <p className="text-sm font-medium text-foreground truncate" title={submission.description}>
                            Laporan #{submission.referenceId}: {submission.description.substring(0, 60)}{submission.description.length > 60 ? '...' : ''}
                         </p>
                         <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Tag className="h-3 w-3"/> {submission.category}
                         </div>
                       </div>
                     </div>
                     <div className="flex items-center gap-4 text-sm justify-end md:justify-start mt-2 md:mt-0">
                       <Badge variant={getStatusBadgeVariant(submission.status)} className={`capitalize ${getStatusTextColor(submission.status)}`}>
                         {submission.status}
                       </Badge>
                       <div className="flex items-center gap-1 text-muted-foreground text-xs whitespace-nowrap">
                         <CalendarDays className="h-3 w-3"/>
                         {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true, locale: id })}
                       </div>
                     </div>
                   </div>
                 </AccordionTrigger>
                 <AccordionContent className="px-4 pb-4 pt-0 text-muted-foreground text-sm space-y-2">
                    <p>{submission.description}</p>
                    {submission.fileUrl && (
                         <Button variant="link" size="sm" asChild className="p-0 h-auto text-accent hover:text-accent/80">
                            <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">Lihat Lampiran</a>
                        </Button>
                    )}
                     {/* Add internal comments display here if needed for admins */}
                 </AccordionContent>
               </AccordionItem>
            </Accordion>
          ))
        ) : (
          <Card className="text-center py-12 bg-card">
             <CardContent className="space-y-2">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-semibold">Tidak Ada Laporan</p>
                <p className="text-muted-foreground">Belum ada laporan yang sesuai dengan filter Anda.</p>
             </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={currentPage > 1 ? `${pathname}?${createQueryString({ page: currentPage - 1 })}` : '#'}
                aria-disabled={currentPage <= 1}
                tabIndex={currentPage <= 1 ? -1 : undefined}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : undefined}
                onClick={(e) => { if (currentPage <= 1) e.preventDefault(); }}
              />
            </PaginationItem>

            {/* Simplified Pagination Logic - Consider a more robust solution for many pages */}
             {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                 <PaginationItem key={page}>
                    <PaginationLink
                        href={`${pathname}?${createQueryString({ page: page })}`}
                        isActive={currentPage === page}
                        aria-current={currentPage === page ? "page" : undefined}
                    >
                        {page}
                    </PaginationLink>
                </PaginationItem>
             ))}


            <PaginationItem>
              <PaginationNext
                href={currentPage < totalPages ? `${pathname}?${createQueryString({ page: currentPage + 1 })}` : '#'}
                 aria-disabled={currentPage >= totalPages}
                 tabIndex={currentPage >= totalPages ? -1 : undefined}
                 className={currentPage >= totalPages ? "pointer-events-none opacity-50" : undefined}
                 onClick={(e) => { if (currentPage >= totalPages) e.preventDefault(); }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
