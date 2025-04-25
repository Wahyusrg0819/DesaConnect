// Define the structure for an internal comment (used by admins)
export interface InternalComment {
  text: string;
  author: string; // Admin name or ID
  createdAt: string; // ISO date string
}

// Define the main Submission type (the shape we want for the frontend)
export interface Submission {
  id: string; // Unique internal ID (string)
  referenceId: string; // Unique user-facing ID
  name?: string; // Submitter's name (optional)
  contactInfo?: string; // Submitter's contact info (optional, email/phone)
  category: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  createdAt: string; // ISO date string
  fileUrl?: string | null;
  priority: 'Urgent' | 'Regular';
  internalComments?: InternalComment[];
  // __v is typically excluded from the final type for the frontend
}

// Define the type for a Mongoose Document (often includes _id, __v)
// We can import Mongoose types for this if needed, but for a lean() result,
// we primarily care about the schema fields + _id and __v if they are present.
// A simple approach is to extend the base Submission interface for lean results
// or define a separate one if the lean shape is significantly different.

// Let's define a type that represents the structure returned by Mongoose .lean()
// It's similar to Submission but with MongoDB ObjectId for _id and potentially __v.
// We can use this type when casting results before mapping.

import { Document, Types } from 'mongoose';

// This interface represents the structure of the document as it comes from Mongoose BEFORE mapping to the plain Submission type.
// It includes the MongoDB _id (as ObjectId) and __v.
export interface SubmissionDocument extends Document {
  name?: string;
  contactInfo?: string;
  category: string;
  description: string;
  createdAt: Date; // Mongoose returns Date objects by default (before .lean() mapping)
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
