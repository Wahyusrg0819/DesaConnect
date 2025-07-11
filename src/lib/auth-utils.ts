"use server";

import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Simple cache for admin status - expires after 15 minutes
const adminCache = new Map<string, { isAdmin: boolean, timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes in milliseconds

// Fungsi untuk memeriksa apakah user adalah admin yang sah
export const isAuthorizedAdmin = async (email: string | null | undefined): Promise<boolean> => {
  if (!email || typeof email !== 'string') return false;
  
  const normalizedEmail = email.trim().toLowerCase();
  const startTime = Date.now();

  console.log(`[AUTH] Checking admin authorization for: ${normalizedEmail}`);

  // Check cache first
  const cachedResult = adminCache.get(normalizedEmail);
  if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_TTL) {
    console.log(`[PERF] Using cached admin status for ${normalizedEmail}, result: ${cachedResult.isAdmin}, elapsed: ${Date.now() - startTime}ms`);
    return cachedResult.isAdmin;
  }
  
  let isAdmin = false;

  // Check database only (removed environment variable dependency)
  try {
    console.log(`[AUTH] Checking database for admin status: ${normalizedEmail}`);
    const dbCheckStart = Date.now();
    
    // Use service role client to bypass RLS for admin checks
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[AUTH] Missing Supabase credentials for admin check');
      return false;
    }
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    
    const { data, error } = await supabaseAdmin
      .from('admin_list')
      .select('email')
      .eq('email', normalizedEmail)
      .single();
      
    if (!error && data) {
      isAdmin = true;
      console.log(`[AUTH] ✅ Admin found in database: ${normalizedEmail}, db elapsed: ${Date.now() - dbCheckStart}ms, total: ${Date.now() - startTime}ms`);
    } else if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" - not really an error
      console.error('[AUTH] Database error checking admin status:', error);
      // Only log real DB errors, not "not found"
    } else {
      console.log(`[AUTH] ❌ Email not found in database: ${normalizedEmail}`);
    }
  } catch (err) {
    console.error('[AUTH] Exception checking admin_list table:', err);
  }
  
  // Cache the result
  adminCache.set(normalizedEmail, { 
    isAdmin, 
    timestamp: Date.now() 
  });
  
  console.log(`[AUTH] Final result for ${normalizedEmail}: ${isAdmin ? '✅ AUTHORIZED' : '❌ NOT AUTHORIZED'}, total elapsed: ${Date.now() - startTime}ms`);
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

// Function to clear admin cache (useful for debugging)
export const clearAdminCache = async (email?: string) => {
  if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    adminCache.delete(normalizedEmail);
    console.log(`[AUTH] Cache cleared for: ${normalizedEmail}`);
  } else {
    adminCache.clear();
    console.log(`[AUTH] All admin cache cleared`);
  }
};

// Function to view current cache (for debugging)
export const getAdminCache = async () => {
  const cacheEntries = Array.from(adminCache.entries()).map(([email, data]) => ({
    email,
    isAdmin: data.isAdmin,
    timestamp: new Date(data.timestamp).toISOString(),
    ageMinutes: Math.round((Date.now() - data.timestamp) / (60 * 1000))
  }));
  console.log(`[AUTH] Current cache entries:`, cacheEntries);
  return cacheEntries;
};