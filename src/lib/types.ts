// Define the structure for an internal comment (used by admins)
export interface InternalComment {
  text: string;
  author: string; // Admin name or ID
  createdAt: string; // ISO date string
}

// Define the main Submission type
export interface Submission {
  id: string; // Unique internal ID (e.g., database ID)
  referenceId: string; // Unique user-facing ID (e.g., "ID-00123")
  name?: string; // Submitter's name (optional)
  contactInfo?: string; // Submitter's contact info (optional, email/phone)
  category: string; // e.g., 'Infrastructure', 'Education'
  description: string; // Detailed text of the submission
  status: 'Pending' | 'In Progress' | 'Resolved'; // Current status
  createdAt: string; // ISO date string when submitted
  fileUrl?: string | null; // URL to the uploaded file (optional)
  priority: 'Urgent' | 'Regular'; // Priority level set by admin
  internalComments?: InternalComment[]; // Array of internal comments (optional, admin-only)
  // Add other fields as needed, e.g., resolvedAt, assignedTo
}
