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

    // Validasi input
    const validation = loginSchema.safeParse(rawData);
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
    }

    const validatedData = validation.data;

    // Make sure email is a valid string before checking admin status
    if (!validatedData.email || typeof validatedData.email !== 'string') {
      return { success: false, error: 'Email tidak valid' };
    }
    
    console.log(`[PERF] Input validation completed in ${Date.now() - startTime}ms`);

    // Khusus untuk tahap development/debugging
    if (validatedData.email === 'wahyumuliadisiregar@student.uir.ac.id' && 
        validatedData.password === 'Admin123456') {
      
      console.log('[PERF] Using dev hardcoded credentials');
      
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
        
        console.log(`[PERF] Login success with hardcoded credentials, total time: ${Date.now() - startTime}ms`);
        return { success: true };
      } catch (cookieError) {
        console.error('Error setting admin_session cookie:', cookieError);
        return { success: false, error: 'Gagal mengatur session' };
      }
    }

    // Check admin status using DB
    try {
      const adminCheckStart = Date.now();
      console.log('[PERF] Starting admin status check');
      
      const isAdmin = await isAuthorizedAdmin(validatedData.email);
      console.log(`[PERF] Admin check completed in ${Date.now() - adminCheckStart}ms`);
      
      if (!isAdmin) {
        console.log(`[PERF] Login failed: not an admin, total time: ${Date.now() - startTime}ms`);
        return { success: false, error: 'Email tidak terdaftar sebagai admin' };
      }
      
      // If email is in admin list, set up a cookie session
      try {
        const cookieStart = Date.now();
        // Set cookie dengan opsi yang benar
        const cookieStore = await cookies();
        cookieStore.set('admin_session', validatedData.email, {
          httpOnly: true,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24, // 1 day in seconds
        });
        
        console.log(`[PERF] Cookie set in ${Date.now() - cookieStart}ms, total login time: ${Date.now() - startTime}ms`);
        return { success: true };
      } catch (cookieError) {
        console.error('Error setting cookie:', cookieError);
        return { success: false, error: 'Gagal mengatur session' };
      }
    } catch (adminCheckError) {
      console.error('Error checking admin status:', adminCheckError);
      console.log(`[PERF] Login failed with error, total time: ${Date.now() - startTime}ms`);
      return { success: false, error: 'Gagal memeriksa status admin' };
    }
  } catch (error: any) {
    console.error('Error in loginAdmin:', error);
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

    // Add the admin to the admin_list table first
    try {
      const { error: insertError } = await supabaseAdmin
        .from('admin_list')
        .insert({ email: email.toLowerCase() });

      if (insertError && insertError.code !== '23505') { // Ignore if already exists
        console.error("Error adding admin to admin_list:", insertError);
        return {
          error: "Gagal menambahkan admin ke daftar.",
          data: null,
        };
      }
    } catch (error) {
      console.error("Error inserting into admin_list table:", error);
      return {
        error: "Gagal menambahkan admin ke daftar.",
        data: null,
      };
    }
    
    // Skip the actual auth creation for now since we're using a fallback mechanism
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