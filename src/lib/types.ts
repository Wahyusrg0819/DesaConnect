// Define the structure for an internal comment (used by admins)
export interface InternalComment {
  text: string;
  author: string; // Admin name or ID
  createdAt: string; // ISO date string
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

// Keep MongoDB types for backward compatibility if needed
import { Document, Types } from 'mongoose';

// This interface represents the structure of the document as it comes from Mongoose
export interface SubmissionDocument extends Document {
  name?: string;
  contactInfo?: string;
  category: string;
  description: string;
  createdAt: Date; // Mongoose returns Date objects by default
  referenceId: string;
  status: 'pending' | 'in progress' | 'resolved'; // Mongoose schema has lowercase enum
  fileUrl?: string | null;
  priority: 'Urgent' | 'Regular';
  internalComments?: {
      text: string;
      author: string;
      createdAt: Date; // Dates within sub-documents are also Date objects
      _id: Types.ObjectId; // Mongoose adds _id to sub-documents
  }[];
  // Mongoose Document also includes _id (as ObjectId) and __v
  _id: Types.ObjectId;
  __v?: number; // __v is also typically present
}
