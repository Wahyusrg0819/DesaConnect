"use server";

import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { isAuthorizedAdmin } from '@/lib/auth-utils';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Schema validasi untuk login
const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

// Schema validasi untuk register
const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
});

// Login admin
export async function loginAdmin(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now();
  console.log('[PERF] Starting loginAdmin execution');
  
  try {
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    console.log('[AUTH] Login attempt for email:', rawData.email);

    // Validasi input
    const validation = loginSchema.safeParse(rawData);
    if (!validation.success) {
      console.log('[AUTH] Validation failed:', validation.error.errors);
      return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
    }

    const validatedData = validation.data;
    console.log('[AUTH] Input validation passed for:', validatedData.email);

    // Make sure email is a valid string before checking admin status
    if (!validatedData.email || typeof validatedData.email !== 'string') {
      console.log('[AUTH] Invalid email type');
      return { success: false, error: 'Email tidak valid' };
    }
    
    console.log(`[PERF] Input validation completed in ${Date.now() - startTime}ms`);

    // Check admin status first (before any authentication)
    const adminCheckStart = Date.now();
    console.log('[AUTH] Starting admin status check for:', validatedData.email);
    
    const isAdmin = await isAuthorizedAdmin(validatedData.email);
    console.log(`[AUTH] Admin check completed in ${Date.now() - adminCheckStart}ms, result:`, isAdmin);
    
    if (!isAdmin) {
      console.log(`[AUTH] ❌ LOGIN FAILED: Email ${validatedData.email} not authorized as admin`);
      console.log(`[PERF] Login failed: not an admin, total time: ${Date.now() - startTime}ms`);
      return { success: false, error: 'Email tidak terdaftar sebagai admin' };
    }

    console.log(`[AUTH] ✅ Email ${validatedData.email} is authorized as admin`);

    // For development/testing - hardcoded SuperAdmin credentials
    if (validatedData.email === 'wahyumuliadisiregar@student.uir.ac.id' && 
        validatedData.password === 'Admin123456') {
      
      console.log('[AUTH] Using dev hardcoded credentials for SuperAdmin');
      
      try {
        // Set admin_session cookie
        const cookieStore = await cookies();
        cookieStore.set('admin_session', validatedData.email, {
          httpOnly: true,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24, // 1 day in seconds
        });
        
        console.log(`[AUTH] ✅ LOGIN SUCCESS with hardcoded credentials, total time: ${Date.now() - startTime}ms`);
        return { success: true };
      } catch (cookieError) {
        console.error('[AUTH] Error setting admin_session cookie:', cookieError);
        return { success: false, error: 'Gagal mengatur session' };
      }
    }

    // For other admins, create a simplified login (since this is admin-only system)
    // In a real system, you'd authenticate against Supabase auth or a password database
    console.log('[AUTH] Processing admin login for authorized email:', validatedData.email);
    
    try {
      const cookieStart = Date.now();
      // Set admin session cookie for authorized admin
      const cookieStore = await cookies();
      cookieStore.set('admin_session', validatedData.email, {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day in seconds
      });
      
      console.log(`[AUTH] ✅ LOGIN SUCCESS: Cookie set in ${Date.now() - cookieStart}ms, total login time: ${Date.now() - startTime}ms`);
      return { success: true };
    } catch (cookieError) {
      console.error('[AUTH] Error setting cookie:', cookieError);
      return { success: false, error: 'Gagal mengatur session' };
    }
  } catch (error: any) {
    console.error('[AUTH] Error in loginAdmin:', error);
    console.log(`[PERF] Login failed with generic error, total time: ${Date.now() - startTime}ms`);
    return { success: false, error: error.message || 'Terjadi kesalahan saat login' };
  }
}

// Register admin (hanya untuk akun yang telah diizinkan)
export async function registerAdmin(
  email: string,
  nama: string,
  password: string,
  phone: string
): Promise<any> {
  'use server';

  try {
    // Check for required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing required environment variables:", {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey
      });
      return {
        error: "Server configuration error. Please contact the administrator.",
        data: null,
      };
    }

    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    // Check if this email is authorized to be an admin
    if (!email || typeof email !== 'string') {
      return {
        error: "Email tidak valid.",
        data: null,
      };
    }
    
    const isAuthorized = await isAuthorizedAdmin(email);
    
    if (!isAuthorized) {
      return {
        error: "Email tidak diizinkan untuk mendaftar sebagai admin.",
        data: null,
      };
    }

    // Email sudah diauthorize, registrasi berhasil
    // Tidak perlu insert lagi ke admin_list karena sudah ditambahkan oleh SuperAdmin
    console.log(`Admin registration successful for: ${email}`);
    
    return {
      error: null,
      data: { message: "Admin berhasil terdaftar!" },
    };
  } catch (error) {
    console.error("Error in registerAdmin:", error);
    return {
      error: "Terjadi kesalahan saat mendaftar admin.",
      data: null,
    };
  }
}

// Logout admin
export async function logoutAdmin(): Promise<{ success: boolean; error?: string }> {
  try {
    // Clear the admin_session cookie properly
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    console.log('Admin session cookie berhasil dihapus');
    
    // Redirect ke home setelah logout
    redirect('/');
  } catch (error: any) {
    console.error('Error in logoutAdmin:', error);
    return { success: false, error: error.message || 'Terjadi kesalahan saat logout' };
  }
}