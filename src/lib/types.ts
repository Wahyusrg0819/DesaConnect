// Define the structure for an internal comment (used by admins)
// Must match the JSONB shape stored in the database: { id, text, timestamp }
export interface InternalComment {
  id: string;
  text: string;
  timestamp: string; // ISO date string
}

// Define the main Submission type (the shape we want for the frontend)
export interface Submission {
  id: string; // Unique internal ID (UUID for Supabase)
  referenceId: string; // Unique user-facing ID
  name?: string; // Submitter's name (optional)
  contactInfo?: string; // Submitter's contact info (optional, email/phone)
  category: string;
  description: string;
  status: string; // 'pending', 'in progress', 'resolved'
  createdAt: Date; // Date object, changed from string for flexibility
  fileUrl?: string | null;
  priority: 'Urgent' | 'Regular';
  internalComments?: InternalComment[];
}

// Supabase Database types
export interface SupabaseSubmission {
  id: string; // UUID
  reference_id: string;
  name: string;
  contact_info?: string;
  category: string;
  description: string;
  status: string;
  created_at: string; // ISO date string from Supabase
  file_url?: string;
  priority: string;
  internal_comments: InternalComment[];
}
