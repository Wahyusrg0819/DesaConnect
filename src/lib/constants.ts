// Single source of truth for categories, statuses, priorities, and routes.
// These values MUST match what is stored in the Supabase database.

// --- Submission Categories (Indonesian, matching DB) ---
export const CATEGORIES = [
  'Infrastruktur',
  'Pendidikan',
  'Kesehatan',
  'Kesejahteraan Sosial',
  'Lainnya',
] as const;

export type Category = (typeof CATEGORIES)[number];

// --- Submission Statuses (lowercase, matching DB default) ---
export const STATUSES = ['pending', 'in progress', 'resolved'] as const;
export type SubmissionStatus = (typeof STATUSES)[number];

// Display labels (Indonesian) for statuses
export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: 'Menunggu',
  'in progress': 'Diproses',
  resolved: 'Selesai',
};

// Map any common variant back to the canonical DB value
export const STATUS_MAP: Record<string, SubmissionStatus> = {
  Pending: 'pending',
  'In Progress': 'in progress',
  Resolved: 'resolved',
  pending: 'pending',
  'in progress': 'in progress',
  resolved: 'resolved',
};

// --- Priorities ---
export const PRIORITIES = ['Urgent', 'Regular'] as const;
export type Priority = (typeof PRIORITIES)[number];

// --- Route Constants ---
export const ROUTES = {
  HOME: '/',
  SUBMIT: '/submit',
  TRACK: '/track',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_REGISTER: '/admin/register',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_SUBMISSIONS: '/admin/dashboard/submissions',
  ADMIN_ANALYTICS: '/admin/dashboard/analytics',
  ADMIN_SETTINGS: '/admin/dashboard/settings',
} as const;
