"use server";

import { z } from "zod";
import type { Submission, SubmissionDocument, InternalComment } from '@/lib/types'; // Import InternalComment from types
import { promises as fs } from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase'; // Import Supabase client
import { v4 as uuidv4 } from 'uuid'; // Import untuk membuat UUID

// Add type definitions at the top of the file after imports
type SubmissionStatus = 'pending' | 'in progress' | 'resolved';
type DisplayStatus = 'Pending' | 'In Progress' | 'Resolved';

// Status mapping constant
const STATUS_MAP: Record<string, SubmissionStatus> = {
  'Pending': 'pending',
  'In Progress': 'in progress',
  'Resolved': 'resolved',
  'pending': 'pending',
  'in progress': 'in progress',
  'resolved': 'resolved'
} as const;

// Validate if a status string is a valid SubmissionStatus
function isValidStatus(status: string): status is SubmissionStatus {
  return ['pending', 'in progress', 'resolved'].includes(status.toLowerCase());
}

// --- Zod Schema for Input Validation ---
const submissionSchema = z.object({
  name: z.string().optional(),
  contactInfo: z.string().optional(),
  category: z.string(),
  description: z.string().min(10).max(1000),
  // File is handled separately via FormData
});

// --- Helper Functions ---

// Function untuk generate reference ID unik alphanumeric
function generateReferenceId(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Simulates saving a file and returning its URL (replace with actual storage logic)
async function saveFile(file: File): Promise<string | null> {
    if (!file) return null;

    try {
        // Gunakan Supabase Storage sebagai gantinya
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const fileBuffer = await file.arrayBuffer();
        
        // Upload file ke Supabase Storage
        const { data, error } = await supabase
            .storage
            .from('submissions') // Bucket name
            .upload(`files/${fileName}`, fileBuffer, {
                contentType: file.type,
            });
            
        if (error) {
            console.error("Error uploading file to Supabase:", error);
            return null;
        }
        
        // Dapatkan public URL untuk file
        const { data: urlData } = supabase
            .storage
            .from('submissions')
            .getPublicUrl(`files/${fileName}`);
            
        return urlData.publicUrl;
    } catch (error) {
        console.error("Error saving file:", error);
        return null; // Indicate failure
    }
}

// Helper to convert Json to InternalComment[]
function convertJsonToInternalComments(comments: any): InternalComment[] {
  if (!Array.isArray(comments)) return [];
  
  return comments.map(comment => ({
    text: comment.text || '',
    author: comment.author || '',
    createdAt: comment.createdAt || new Date().toISOString()
  }));
}

// --- Server Actions ---

/**
 * Creates a new submission.
 * Handles file upload if present.
 * Saves data to Supabase.
 */
export async function createSubmission(formData: FormData): Promise<{ success: boolean; referenceId?: string; error?: string }> {
  try {
    const rawData = {
        name: formData.get('name') as string | undefined,
        contactInfo: formData.get('contactInfo') as string | undefined,
        category: formData.get('category') as string,
        description: formData.get('description') as string,
    };
    const file = formData.get('file') as File | null;

    // Validate text fields
    const validation = submissionSchema.safeParse(rawData);
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
    }

    const validatedData = validation.data;

    // Handle file upload
    let fileUrl: string | null = null;
    if (file) {
         if (file.size > 5 * 1024 * 1024) { // 5MB limit
            return { success: false, error: "Ukuran file melebihi batas 5MB." };
         }
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
         if (!allowedTypes.includes(file.type)) {
             return { success: false, error: "Tipe file tidak diizinkan." };
         }

        fileUrl = await saveFile(file);
        if (fileUrl === null) {
             return { success: false, error: "Gagal menyimpan file lampiran." };
        }
    }

    // Generate unique reference ID
    const referenceId = generateReferenceId();

    // Prepare internal comments as empty array
    const internalComments: any[] = [];

    // Insert data into Supabase
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        reference_id: referenceId,
        name: validatedData.name || 'Anonymous',
        contact_info: validatedData.contactInfo,
        category: validatedData.category,
        description: validatedData.description,
        file_url: fileUrl,
        status: 'pending',
        priority: 'Regular',
        internal_comments: internalComments
      })
      .select('reference_id');

    if (error) {
      console.error("Error creating submission (Supabase):", error);
      // Handle duplicate reference ID
      if (error.code === '23505') { // PostgreSQL unique constraint violation code
        return { success: false, error: "Gagal membuat laporan: Terjadi duplikasi ID referensi. Coba lagi." };
      }
      return { success: false, error: error.message || "Gagal membuat laporan." };
    }

    console.log("New submission created (Supabase):", data);

    // Return success and the generated referenceId
    return { success: true, referenceId: referenceId };

  } catch (error: any) {
    console.error("Error in createSubmission:", error);
    return { success: false, error: error.message || "Terjadi kesalahan saat membuat laporan." };
  }
}

/**
 * Fetches submissions with filtering, sorting, searching, and pagination from Supabase.
 */
export async function fetchSubmissions(params: {
  category?: string;
  status?: string;
  sortBy?: string;
  search?: string;
  page?: number;
  limit?: number;
  isPublicView?: boolean;
}): Promise<{ submissions: Submission[]; totalCount: number; totalPages: number; }> {
  try {
    const { category, status, sortBy = 'date_desc', search, page = 1, limit = 10, isPublicView = true } = params;

    // Buat query dasar
    let query = supabase
      .from('submissions')
      .select('*', { count: 'exact' });

    // Tambahkan filter berdasarkan kategori
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Tambahkan filter berdasarkan status
    if (status && status !== 'all') {
      // Convert and validate status
      const normalizedStatus = STATUS_MAP[status] || status.toLowerCase();
      if (!isValidStatus(normalizedStatus)) {
        console.error('Invalid status:', status);
        console.error('Normalized status:', normalizedStatus);
        throw new Error(`Invalid status value: ${status}`);
      }
      query = query.eq('status', normalizedStatus);
    }

    // Tambahkan pencarian
    if (search && search.trim() !== '') {
      query = query.or(
        `description.ilike.%${search}%,reference_id.ilike.%${search}%,name.ilike.%${search}%,category.ilike.%${search}%`
      );
    }

    // Tambahkan pengurutan
    if (sortBy === 'date_asc') {
      query = query.order('created_at', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Tambahkan pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Log query untuk debugging
    console.log('Query Parameters:', {
      category,
      status,
      search,
      sortBy,
      page,
      limit,
      from,
      to
    });

    // Eksekusi query
    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching submissions:", error);
      throw error;
    }

    if (!data) {
      console.log("No data returned from query");
      return { submissions: [], totalCount: 0, totalPages: 0 };
    }

    // Log hasil query untuk debugging
    console.log('Query Results:', {
      resultCount: data.length,
      totalCount: count,
      firstItem: data[0],
      params: params
    });

    // Transformasi data ke format yang diharapkan
    const submissions: Submission[] = data.map((item: any) => ({
      id: item.id,
      name: item.name || undefined,
      contactInfo: item.contact_info || undefined,
      category: item.category,
      description: item.description,
      createdAt: new Date(item.created_at),
      referenceId: item.reference_id,
      status: item.status,
      fileUrl: item.file_url,
      priority: item.priority,
      internalComments: convertJsonToInternalComments(item.internal_comments),
    }));

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return { submissions, totalCount, totalPages };
  } catch (error: any) {
    console.error("Error in fetchSubmissions:", error);
    throw new Error(`Failed to fetch submissions: ${error.message}`);
  }
}

/**
 * Fetches a submission by its reference ID from Supabase.
 */
export async function getSubmissionByReferenceId(referenceId: string): Promise<{ success: boolean; submission?: Submission; error?: string }> {
  try {
    // Cari submission berdasarkan referenceId
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('reference_id', referenceId)
      .single();

    if (error) {
      console.error("Error fetching submission (Supabase):", error);
      return { success: false, error: "Laporan tidak ditemukan." };
    }

    if (!data) {
      return { success: false, error: "Laporan dengan ID Referensi tersebut tidak ditemukan." };
    }

    // Transformasi data ke format yang diharapkan
    const submission: Submission = {
      id: data.id,
      name: data.name || undefined,
      contactInfo: data.contact_info || undefined,
      category: data.category,
      description: data.description,
      createdAt: new Date(data.created_at),
      referenceId: data.reference_id,
      status: data.status,
      fileUrl: data.file_url,
      priority: data.priority,
      internalComments: convertJsonToInternalComments(data.internal_comments),
    };

    return { success: true, submission };
  } catch (error: any) {
    console.error("Error in getSubmissionByReferenceId:", error);
    return { success: false, error: error.message || "Terjadi kesalahan saat mencari laporan." };
  }
}

/**
 * Updates a submission's status (and optionally priority) in Supabase.
 */
export async function updateSubmissionStatus(id: string, status: string, priority?: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Validasi status
    const validStatuses = ['pending', 'in progress', 'resolved'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return { success: false, error: "Status tidak valid." };
    }

    // Prepare data update
    const updateData: any = { 
      status: status.toLowerCase()
    };

    // Add priority if provided
    if (priority) {
      const validPriorities = ['Urgent', 'Regular'];
      if (!validPriorities.includes(priority)) {
        return { success: false, error: "Prioritas tidak valid." };
      }
      updateData.priority = priority;
    }

    // Update Supabase
    const { error } = await supabase
      .from('submissions')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error("Error updating submission status (Supabase):", error);
      return { success: false, error: error.message || "Gagal mengubah status." };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in updateSubmissionStatus:", error);
    return { success: false, error: error.message || "Terjadi kesalahan saat mengubah status." };
  }
}

/**
 * Adds an internal comment to a submission in Supabase.
 */
export async function addInternalComment(id: string, comment: string, adminName: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Validasi input
    if (!comment || !adminName) {
      return { success: false, error: "Komentar dan nama admin diperlukan." };
    }

    // Ambil komentar yang ada
    const { data, error: fetchError } = await supabase
      .from('submissions')
      .select('internal_comments')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error("Error fetching comments (Supabase):", fetchError);
      return { success: false, error: "Gagal menambahkan komentar." };
    }

    // Buat array komentar baru
    const currentComments = Array.isArray(data.internal_comments) ? data.internal_comments : [];
    const newComment = {
      text: comment,
      author: adminName,
      createdAt: new Date().toISOString(),
    };
    const updatedComments = [...currentComments, newComment];

    // Update komentar di Supabase
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ internal_comments: updatedComments })
      .eq('id', id);

    if (updateError) {
      console.error("Error adding comment (Supabase):", updateError);
      return { success: false, error: updateError.message || "Gagal menambahkan komentar." };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in addInternalComment:", error);
    return { success: false, error: error.message || "Terjadi kesalahan saat menambahkan komentar." };
  }
}

/**
 * Gets statistics about submissions from Supabase.
 */
export async function getSubmissionStats(): Promise<{ success: boolean; stats?: any; error?: string }> {
  try {
    // Dapatkan total submissions
    const { count: totalCount, error: countError } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error("Error counting submissions (Supabase):", countError);
      return { success: false, error: "Gagal mendapatkan statistik." };
    }

    // Dapatkan jumlah per status
    const statuses = ['pending', 'in progress', 'resolved'] as const;
    const statusCounts = await Promise.all(
      statuses.map(async (status) => {
        const { count, error } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .eq('status', status);
          
        return { status, count: count || 0 };
      })
    );

    // Dapatkan jumlah per kategori
    const { data: categories, error: categoriesError } = await supabase
      .from('submissions')
      .select('category');
      
    if (categoriesError) {
      console.error("Error fetching categories (Supabase):", categoriesError);
      return { success: false, error: "Gagal mendapatkan statistik kategori." };
    }
    
    // Hitung jumlah per kategori
    const categoryCounts: Record<string, number> = {};
    categories.forEach((item: any) => {
      const category = item.category;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    // Dapatkan data submissions untuk analisis trending dan waktu penyelesaian
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('created_at, status, updated_at, internal_comments')
      .order('created_at', { ascending: true });

    if (submissionsError) {
      console.error("Error fetching submissions for trends (Supabase):", submissionsError);
      return { success: false, error: "Gagal mendapatkan data tren." };
    }

    // Analisis data bulanan
    const monthlyData = getMonthlyTrendData(submissions);
    
    // Hitung rata-rata waktu penyelesaian
    const processingTime = calculateProcessingTime(submissions);

    // Format hasil
    const stats = {
      total: totalCount || 0,
      byStatus: Object.fromEntries(statusCounts.map(item => [item.status, item.count])),
      byCategory: categoryCounts,
      monthlyTrends: monthlyData,
      processingTime
    };

    return { success: true, stats };
  } catch (error: any) {
    console.error("Error in getSubmissionStats:", error);
    return { success: false, error: error.message || "Terjadi kesalahan saat mengambil statistik." };
  }
}

/**
 * Calculates average processing time of submissions
 */
function calculateProcessingTime(submissions: any[]) {
  if (!submissions || submissions.length === 0) {
    return {
      averageResolutionDays: 0,
      averageResponseDays: 0,
      resolvedCount: 0,
      respondedCount: 0
    };
  }
  
  // Filter resolved submissions only for resolution time calculation
  const resolvedSubmissions = submissions.filter(sub => 
    sub.status === 'resolved' && 
    sub.created_at && 
    sub.updated_at
  );
  
  let averageResolutionDays = 0;
  if (resolvedSubmissions.length > 0) {
    let totalResolutionTime = 0;
    
    resolvedSubmissions.forEach(sub => {
      try {
        const createdAt = new Date(sub.created_at);
        const updatedAt = new Date(sub.updated_at);
        
        // Validate dates
        if (isNaN(createdAt.getTime()) || isNaN(updatedAt.getTime())) {
          console.warn('Invalid date found in submission:', sub.id);
          return;
        }
        
        const timeDiff = updatedAt.getTime() - createdAt.getTime();
        const daysDiff = Math.max(0, timeDiff / (1000 * 3600 * 24)); // Ensure positive
        totalResolutionTime += daysDiff;
      } catch (error) {
        console.warn('Error calculating resolution time for submission:', sub.id, error);
      }
    });
    
    averageResolutionDays = totalResolutionTime / resolvedSubmissions.length;
  }
  
  // Calculate average first response time 
  // (time from created_at to first status change or first admin action)
  let totalResponseTime = 0;
  let submissionsWithResponse = 0;
  
  submissions.forEach(sub => {
    try {
      if (!sub.created_at) return;
      
      const createdAt = new Date(sub.created_at);
      if (isNaN(createdAt.getTime())) return;
      
      let firstResponseDate = null;
      
      // Check for status change from 'pending' to other status
      if (sub.status !== 'pending' && sub.updated_at) {
        const updatedAt = new Date(sub.updated_at);
        if (!isNaN(updatedAt.getTime()) && updatedAt > createdAt) {
          firstResponseDate = updatedAt;
        }
      }
      
      // Check for internal comments (if they exist in a different structure)
      if (sub.internal_comments && typeof sub.internal_comments === 'string') {
        try {
          const comments = JSON.parse(sub.internal_comments);
          if (Array.isArray(comments) && comments.length > 0 && comments[0].createdAt) {
            const commentDate = new Date(comments[0].createdAt);
            if (!isNaN(commentDate.getTime()) && commentDate > createdAt) {
              if (!firstResponseDate || commentDate < firstResponseDate) {
                firstResponseDate = commentDate;
              }
            }
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      }
      
      // If no other response found, use updated_at if status changed
      if (!firstResponseDate && sub.updated_at && sub.status !== 'pending') {
        const updatedAt = new Date(sub.updated_at);
        if (!isNaN(updatedAt.getTime()) && updatedAt > createdAt) {
          firstResponseDate = updatedAt;
        }
      }
      
      if (firstResponseDate) {
        submissionsWithResponse++;
        const timeDiff = firstResponseDate.getTime() - createdAt.getTime();
        const daysDiff = Math.max(0, timeDiff / (1000 * 3600 * 24));
        totalResponseTime += daysDiff;
      }
    } catch (error) {
      console.warn('Error calculating response time for submission:', sub.id, error);
    }
  });
  
  const averageResponseDays = submissionsWithResponse > 0 
    ? totalResponseTime / submissionsWithResponse 
    : 0;
  
  return {
    averageResolutionDays: parseFloat(averageResolutionDays.toFixed(1)),
    averageResponseDays: parseFloat(averageResponseDays.toFixed(1)),
    resolvedCount: resolvedSubmissions.length,
    respondedCount: submissionsWithResponse
  };
}

/**
 * Processes submission data to generate monthly trends
 */
function getMonthlyTrendData(submissions: any[]) {
  if (!submissions || submissions.length === 0) {
    return [];
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  const currentYear = new Date().getFullYear();
  
  // Initialize monthly data
  const monthlyData = months.map(month => ({
    name: month,
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  }));
  
  // Count submissions by month
  submissions.forEach(sub => {
    const date = new Date(sub.created_at);
    // Only count submissions from current year
    if (date.getFullYear() === currentYear) {
      const monthIndex = date.getMonth();
      
      monthlyData[monthIndex].total += 1;
      
      // Count by status
      if (sub.status === 'pending') {
        monthlyData[monthIndex].pending += 1;
      } else if (sub.status === 'in progress') {
        monthlyData[monthIndex].inProgress += 1;
      } else if (sub.status === 'resolved') {
        monthlyData[monthIndex].resolved += 1;
      }
    }
  });
  
  return monthlyData;
}
