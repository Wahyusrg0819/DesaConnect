"use server";

import { z } from "zod";
import type { Submission } from '@/lib/types';
import { promises as fs } from 'fs';
import path from 'path';

// --- Zod Schema for Input Validation ---
const submissionSchema = z.object({
  name: z.string().optional(),
  contactInfo: z.string().optional(),
  category: z.string(),
  description: z.string().min(10).max(1000),
  // File is handled separately via FormData
});

// --- Placeholder Data Store ---
// In a real application, replace this with database interactions (e.g., Firestore, PostgreSQL)
let submissions: Submission[] = [
    // Example initial data
     { id: '1', referenceId: 'ID-00001', name: 'Budi Santoso', contactInfo: 'budi@example.com', category: 'Infrastructure', description: 'Jalan di depan rumah rusak parah, banyak lubang.', status: 'Pending', createdAt: new Date('2023-10-26T10:00:00Z').toISOString(), fileUrl: null, priority: 'Regular' },
     { id: '2', referenceId: 'ID-00002', name: '', contactInfo: '', category: 'Health', description: 'Puskesmas kekurangan obat batuk anak.', status: 'In Progress', createdAt: new Date('2023-10-27T11:30:00Z').toISOString(), fileUrl: null, priority: 'Urgent' },
     { id: '3', referenceId: 'ID-00003', name: 'Siti Aminah', contactInfo: '08123456789', category: 'Education', description: 'Mohon perbaikan fasilitas perpustakaan desa.', status: 'Resolved', createdAt: new Date('2023-10-25T09:15:00Z').toISOString(), fileUrl: 'https://picsum.photos/200/300', priority: 'Regular' },
      { id: '4', referenceId: 'ID-00004', name: 'Anonymous', contactInfo: '', category: 'Social Welfare', description: 'Bantuan sosial untuk lansia belum merata.', status: 'Pending', createdAt: new Date('2024-07-20T14:00:00Z').toISOString(), fileUrl: null, priority: 'Regular' },
     { id: '5', referenceId: 'ID-00005', name: 'Dewi Lestari', contactInfo: 'dewi@mail.com', category: 'Infrastructure', description: 'Lampu jalan di RT 03 sering mati.', status: 'Pending', createdAt: new Date('2024-07-21T08:45:00Z').toISOString(), fileUrl: null, priority: 'Regular' },
];
let nextId = submissions.length + 1;

// --- Helper Functions ---
function generateReferenceId(): string {
  // Simple ID generator, replace with a more robust unique ID strategy in production
  const paddedId = String(nextId).padStart(5, '0');
  return `ID-${paddedId}`;
}

// Simulates saving a file and returning its URL (replace with actual storage logic)
async function saveFile(file: File): Promise<string | null> {
    if (!file) return null;

    try {
        const uploadsDir = path.join(process.cwd(), 'public/uploads');
        // Ensure the uploads directory exists
        await fs.mkdir(uploadsDir, { recursive: true });

        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const filePath = path.join(uploadsDir, uniqueFilename);

        await fs.writeFile(filePath, fileBuffer);

        // Return the public URL path
        return `/uploads/${uniqueFilename}`;
    } catch (error) {
        console.error("Error saving file:", error);
        return null; // Indicate failure
    }
}

// --- Server Actions ---

/**
 * Creates a new submission.
 * Handles file upload if present.
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

    // Handle file upload (replace with actual cloud storage like Firebase Storage or S3)
    let fileUrl: string | null = null;
    if (file) {
        // Add file size/type validation here if needed (though client-side is good first step)
         if (file.size > 5 * 1024 * 1024) { // 5MB limit on server-side too
            return { success: false, error: "Ukuran file melebihi batas 5MB." };
         }
         // Add allowed types check
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
         if (!allowedTypes.includes(file.type)) {
             return { success: false, error: "Tipe file tidak diizinkan." };
         }

        fileUrl = await saveFile(file);
        if (fileUrl === null) {
             return { success: false, error: "Gagal menyimpan file lampiran." };
        }
    }


    const referenceId = generateReferenceId();
    const newSubmission: Submission = {
      id: String(nextId),
      referenceId,
      name: validatedData.name || 'Anonymous', // Default to Anonymous if empty
      contactInfo: validatedData.contactInfo, // Store contact info if provided
      category: validatedData.category,
      description: validatedData.description,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      fileUrl: fileUrl, // Store the URL of the uploaded file
      priority: 'Regular', // Default priority
    };

    submissions.push(newSubmission);
    nextId++;

    // TODO: Send email confirmation here if contactInfo is an email

    console.log("New submission created:", newSubmission);
    console.log("Current submissions:", submissions);


    return { success: true, referenceId: newSubmission.referenceId };

  } catch (error: any) {
    console.error("Error creating submission:", error);
    return { success: false, error: error.message || "Gagal membuat laporan." };
  }
}

/**
 * Fetches submissions with filtering, sorting, searching, and pagination.
 */
export async function fetchSubmissions(params: {
  category?: string;
  status?: string;
  sortBy?: string;
  search?: string;
  page?: number;
  limit?: number;
  isPublicView?: boolean; // Flag to potentially filter sensitive data for public view
}): Promise<{ submissions: Submission[]; totalCount: number; totalPages: number; }> {
  try {
    const { category, status, sortBy = 'date_desc', search, page = 1, limit = 10, isPublicView = true } = params;

    let filteredSubmissions = submissions;

    // Apply filters
    if (category && category !== 'all') {
      filteredSubmissions = filteredSubmissions.filter(s => s.category === category);
    }
    if (status && status !== 'all') {
      filteredSubmissions = filteredSubmissions.filter(s => s.status === status);
    }

    // Apply search (simple search on description and category for now)
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredSubmissions = filteredSubmissions.filter(s =>
        s.description.toLowerCase().includes(searchTerm) ||
        s.category.toLowerCase().includes(searchTerm) ||
        s.referenceId.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    filteredSubmissions.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priority_desc': // Example: requires 'priority' field with numeric values or levels
           // Assuming 'Urgent' > 'Regular'
           const priorityOrder = { 'Urgent': 2, 'Regular': 1 };
           return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
        case 'priority_asc':
             const priorityOrderAsc = { 'Urgent': 2, 'Regular': 1 };
             return (priorityOrderAsc[a.priority as keyof typeof priorityOrderAsc] || 0) - (priorityOrderAsc[b.priority as keyof typeof priorityOrderAsc] || 0);
        case 'date_desc':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    // Calculate pagination
    const totalCount = filteredSubmissions.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex);

    // Optionally modify data for public view (e.g., hide contact info)
    if (isPublicView) {
        paginatedSubmissions.forEach(s => {
            // Decide if name/contact should be hidden based on original input or admin setting
            // For now, let's assume 'Anonymous' name means hide contact info too.
             if (s.name === 'Anonymous') {
                 s.contactInfo = undefined; // Hide contact info if submitted anonymously
             }
            // Or always hide contact info for public view:
            // s.contactInfo = undefined;
        });
    }


    // Simulate network delay
    // await new Promise(resolve => setTimeout(resolve, 500));

    return {
      submissions: paginatedSubmissions,
      totalCount,
      totalPages,
    };
  } catch (error: any) {
    console.error("Error fetching submissions:", error);
    return { submissions: [], totalCount: 0, totalPages: 0 };
  }
}

/**
 * Gets a single submission by its reference ID.
 */
export async function getSubmissionByReferenceId(referenceId: string): Promise<{ success: boolean; submission?: Submission; error?: string }> {
    try {
        // Basic validation
        if (!referenceId || typeof referenceId !== 'string') {
             return { success: false, error: "ID Referensi tidak valid." };
        }

        const submission = submissions.find(s => s.referenceId === referenceId);

        // Simulate network delay
        // await new Promise(resolve => setTimeout(resolve, 300));

        if (submission) {
             // Optionally hide sensitive data even when tracking by ID
             const publicSubmission = { ...submission };
             // if (publicSubmission.name === 'Anonymous') {
             //     publicSubmission.contactInfo = undefined;
             // }
            return { success: true, submission: publicSubmission };
        } else {
            return { success: false, error: "Laporan tidak ditemukan." };
        }
    } catch (error: any) {
        console.error("Error fetching submission by ID:", error);
        return { success: false, error: "Gagal mengambil data laporan." };
    }
}


// --- Admin Actions (Placeholder - Requires Authentication/Authorization) ---

/**
 * Updates the status or priority of a submission (Admin only).
 */
export async function updateSubmissionStatus(id: string, status: string, priority?: string): Promise<{ success: boolean; error?: string }> {
    // !!! IMPORTANT: Add authentication and authorization checks here !!!
    // Ensure only authorized admins can perform this action.

    try {
        const submissionIndex = submissions.findIndex(s => s.id === id);
        if (submissionIndex === -1) {
            return { success: false, error: "Submission not found." };
        }

        // Validate status
        const allowedStatuses = ['Pending', 'In Progress', 'Resolved'];
        if (!allowedStatuses.includes(status)) {
             return { success: false, error: "Status tidak valid." };
        }

         // Validate priority if provided
        if (priority) {
             const allowedPriorities = ['Urgent', 'Regular'];
             if (!allowedPriorities.includes(priority)) {
                 return { success: false, error: "Prioritas tidak valid." };
             }
              submissions[submissionIndex].priority = priority as 'Urgent' | 'Regular';
        }


        submissions[submissionIndex].status = status as 'Pending' | 'In Progress' | 'Resolved';


        // TODO: Send notification to user if contact info exists and status changed

         console.log("Submission updated:", submissions[submissionIndex]);

        return { success: true };
    } catch (error: any) {
        console.error("Error updating submission status:", error);
        return { success: false, error: "Failed to update submission." };
    }
}

/**
 * Adds an internal comment to a submission (Admin only).
 */
export async function addInternalComment(id: string, comment: string, adminName: string): Promise<{ success: boolean; error?: string }> {
    // !!! IMPORTANT: Add authentication and authorization checks here !!!

    try {
        const submissionIndex = submissions.findIndex(s => s.id === id);
        if (submissionIndex === -1) {
            return { success: false, error: "Submission not found." };
        }

        if (!submissions[submissionIndex].internalComments) {
            submissions[submissionIndex].internalComments = [];
        }

        submissions[submissionIndex].internalComments?.push({
            text: comment,
            author: adminName,
            createdAt: new Date().toISOString(),
        });

         console.log("Internal comment added:", submissions[submissionIndex]);

        return { success: true };
    } catch (error: any) {
        console.error("Error adding internal comment:", error);
        return { success: false, error: "Failed to add comment." };
    }
}

/**
 * Fetches submission statistics (Admin only).
 */
export async function getSubmissionStats(): Promise<{ success: boolean; stats?: any; error?: string }> {
    // !!! IMPORTANT: Add authentication and authorization checks here !!!

    try {
        const totalSubmissions = submissions.length;
        const categoryCounts = submissions.reduce((acc, s) => {
            acc[s.category] = (acc[s.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const statusCounts = submissions.reduce((acc, s) => {
            acc[s.status] = (acc[s.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const stats = {
            totalSubmissions,
            categoryCounts,
            statusCounts,
            // Add more stats as needed (e.g., resolution time average)
        };

        return { success: true, stats };
    } catch (error: any) {
        console.error("Error fetching stats:", error);
        return { success: false, error: "Failed to fetch statistics." };
    }
}
