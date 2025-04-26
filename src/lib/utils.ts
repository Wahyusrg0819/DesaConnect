import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format tanggal dari timestamp ke format yang lebih mudah dibaca
 * @param dateString String timestamp dari database
 * @returns String tanggal yang sudah diformat
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  
  // Cek apakah tanggal valid
  if (isNaN(date.getTime())) return '-';
  
  // Format: DD MMM YYYY, HH:MM
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  
  return new Intl.DateTimeFormat('id-ID', options).format(date);
}
