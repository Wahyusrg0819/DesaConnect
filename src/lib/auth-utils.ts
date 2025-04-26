"use server";

import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';

// Mendapatkan daftar email admin dari variabel lingkungan
function getAllowedAdminEmails(): string[] {
  const adminEmailsString = process.env.ALLOWED_ADMIN_EMAILS || '';
  // Memisahkan email berdasarkan koma dan menghapus spasi
  return adminEmailsString.split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
}

// Simple cache for admin status - expires after 15 minutes
const adminCache = new Map<string, { isAdmin: boolean, timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes in milliseconds

// Fungsi untuk memeriksa apakah user adalah admin yang sah
export const isAuthorizedAdmin = async (email: string | null | undefined): Promise<boolean> => {
  if (!email || typeof email !== 'string') return false;
  
  const normalizedEmail = email.trim().toLowerCase();
  const startTime = Date.now();

  // Check cache first
  const cachedResult = adminCache.get(normalizedEmail);
  if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_TTL) {
    console.log(`[PERF] Using cached admin status for ${normalizedEmail}, elapsed: ${Date.now() - startTime}ms`);
    return cachedResult.isAdmin;
  }
  
  // Initialize with fallback from environment variables first (faster)
  // This moves the env check before the database check for better performance
  const allowedEmails = getAllowedAdminEmails();
  let isAdmin = allowedEmails.some(allowedEmail => allowedEmail === normalizedEmail);
  
  if (isAdmin) {
    console.log(`[PERF] Admin found in environment variables: ${normalizedEmail}, elapsed: ${Date.now() - startTime}ms`);
    // Cache the result
    adminCache.set(normalizedEmail, { 
      isAdmin, 
      timestamp: Date.now() 
    });
    return true;
  }
  
  // If not found in environment variables, check database
  try {
    console.log(`[PERF] Checking database for admin status: ${normalizedEmail}`);
    const dbCheckStart = Date.now();
    
    const { data, error } = await supabase
      .from('admin_list')
      .select('email')
      .eq('email', normalizedEmail)
      .single();
      
    if (!error && data) {
      isAdmin = true;
      console.log(`[PERF] Admin found in database: ${normalizedEmail}, db elapsed: ${Date.now() - dbCheckStart}ms, total: ${Date.now() - startTime}ms`);
    } else if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" - not really an error
      console.error('Database error checking admin status:', error);
      // Only log real DB errors, not "not found"
    }
  } catch (err) {
    console.error('Exception checking admin_list table:', err);
  }
  
  // Cache the result
  adminCache.set(normalizedEmail, { 
    isAdmin, 
    timestamp: Date.now() 
  });
  
  console.log(`[PERF] Admin check complete for ${normalizedEmail}, result: ${isAdmin}, total elapsed: ${Date.now() - startTime}ms`);
  return isAdmin;
};

// Membuat virtual session jika menggunakan cookie admin_session
function createVirtualSessionFromCookie(email: string) {
  return {
    user: {
      id: 'admin-fallback',
      email: email,
      role: 'admin',
    }
  };
}

// Mendapatkan session user saat ini
export async function getSession() {
  const cookieStore = await cookies();
  
  // Check for admin_session cookie first (fallback mechanism)
  const adminSessionValue = cookieStore.get('admin_session')?.value;
  if (adminSessionValue) {
    console.log(`Found admin_session cookie with value: ${adminSessionValue}`);
    // Verify email is still authorized
    const isAdmin = await isAuthorizedAdmin(adminSessionValue);
    if (isAdmin) {
      console.log('Creating virtual session from admin_session cookie');
      return createVirtualSessionFromCookie(adminSessionValue);
    } else {
      console.warn('Invalid admin_session cookie detected, removing');
      cookieStore.delete('admin_session');
    }
  }
  
  // Fallback to Supabase auth if no valid admin_session
  const supabaseClient = supabase;
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting Supabase session:', error);
    return null;
  }
}

// Mendapatkan user saat ini
export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session?.user) {
    return null;
  }
  
  return session.user;
}

// Middleware untuk memproteksi rute admin
export async function protectAdminRoute() {
  const user = await getCurrentUser();
  
  if (!user) {
    // Redirect ke halaman login jika tidak ada user
    redirect('/admin/login');
  }
  
  const userEmail = user.email;
  
  // Periksa apakah user memiliki akses admin
  const isAdmin = await isAuthorizedAdmin(userEmail);
  if (!isAdmin) {
    // Redirect ke halaman utama jika bukan admin
    redirect('/');
  }
} 